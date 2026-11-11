<?php
namespace App\Modules\Personas;

use App\Core\Controller;
use App\Core\Database;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;

class PersonaController extends Controller {
    public function search(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $query = trim($_GET['q'] ?? '');
        if (strlen($query) < 2) {
            Response::success([]);
        }

        $term = "%$query%";
        $stmt = $db->prepare("
            SELECT 
                IdPersona as id,
                DNI as dni,
                Nombres as names,
                Apellidos as surnames,
                CONCAT(Nombres, ' ', Apellidos) as fullName,
                sexo as gender,
                FechaNac as birthDate,
                Direccion as address,
                Telefono as phone,
                email as email,
                IdentidadEstado as identityStatus
            FROM userexternos
            WHERE DNI LIKE ? OR Nombres LIKE ? OR Apellidos LIKE ?
            LIMIT 20
        ");
        $stmt->execute([$term, $term, $term]);
        Response::success($stmt->fetchAll());
    }

    public function lookupDni(string $dni): void {
        AuthMiddleware::authenticate();
        $dni = trim($dni);

        if (strlen($dni) !== 8 || !is_numeric($dni)) {
            Response::error('El DNI debe tener 8 dígitos numéricos', 422);
        }

        $db = Database::getConnection();

        // 1. Buscar primero en base de datos local
        $stmtLocal = $db->prepare("SELECT DNI as dni, Nombres as names, Apellidos as surnames, FechaNac as birthDate, sexo as gender, Direccion as address FROM userexternos WHERE DNI = ? LIMIT 1");
        $stmtLocal->execute([$dni]);
        $local = $stmtLocal->fetch();

        if ($local) {
            Response::success([
                'dni' => $local['dni'],
                'names' => $local['names'],
                'surnames' => $local['surnames'],
                'fullName' => $local['names'] . ' ' . $local['surnames'],
                'source' => 'local'
            ]);
        }

        // 2. Consulta API RENIEC (con timeout y manejo de error para que nunca caiga el sistema si no hay red)
        $token = 'apis-token-12483.U2AwXC75lCTzbZ9la5yi1G9Jd8FLzTiR';
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://api.apis.net.pe/v2/reniec/dni?numero=' . $dni,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 4,
            CURLOPT_HTTPHEADER => [
                'Referer: https://apis.net.pe/consulta-dni-api',
                'Authorization: Bearer ' . $token
            ],
        ]);

        $response = curl_exec($curl);
        $curlErr = curl_error($curl);
        curl_close($curl);

        if (!$curlErr && $response) {
            $data = json_decode($response, true);
            if (!empty($data['nombres'])) {
                $nombres = ucwords(strtolower($data['nombres']));
                $paterno = ucwords(strtolower($data['apellidoPaterno'] ?? ''));
                $materno = ucwords(strtolower($data['apellidoMaterno'] ?? ''));
                $apellidos = trim("$paterno $materno");

                Response::success([
                    'dni' => $dni,
                    'names' => $nombres,
                    'surnames' => $apellidos,
                    'fullName' => "$nombres $apellidos",
                    'source' => 'reniec'
                ]);
            }
        }

        // Fallback: Si la API de RENIEC no responde o no se encuentra
        Response::success([
            'dni' => $dni,
            'names' => '',
            'surnames' => '',
            'fullName' => '',
            'source' => 'manual'
        ], 'No se encontró en RENIEC, puede ingresar los datos manualmente');
    }

    public function getOrientaciones(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT 
                r.IdRegInfo as id,
                r.Fecha as date,
                r.edad as age,
                r.unidad_edad as ageUnit,
                r.MotivoOrientacion as reason,
                u.IdPersona as personId,
                u.DNI as dni,
                CONCAT(u.Nombres, ' ', u.Apellidos) as personName,
                u.Telefono as phone,
                u.Direccion as address,
                CONCAT(t.Nombres, ' ', t.Apellidos) as workerName
            FROM registroinfo r
            INNER JOIN userexternos u ON r.IdPersona = u.IdPersona
            INNER JOIN trabajadores t ON r.IdTrabajador = t.IdTrabajador
            ORDER BY r.IdRegInfo DESC
        ");

        Response::success($stmt->fetchAll());
    }

    public function storeOrientacion(): void {
        $user = AuthMiddleware::authenticate();
        $body = $this->getJsonBody();

        $db = Database::getConnection();

        $dni = !empty($body['dni']) ? trim($body['dni']) : null;
        $names = ucwords(strtolower(trim($body['names'] ?? '')));
        $surnames = ucwords(strtolower(trim($body['surnames'] ?? '')));
        $phone = !empty($body['phone']) ? trim($body['phone']) : null;
        $address = !empty($body['address']) ? trim($body['address']) : null;
        $reason = trim($body['reason'] ?? '');
        $age = isset($body['age']) && is_numeric($body['age']) ? (int)$body['age'] : null;
        $ageUnit = !empty($body['ageUnit']) ? $body['ageUnit'] : 'año';
        $date = !empty($body['date']) ? $body['date'] : date('Y-m-d');

        if (empty($names) || empty($reason)) {
            Response::error('Nombres y motivo de consulta son obligatorios', 422);
        }

        // Buscar o crear persona
        $personId = null;
        if ($dni) {
            $stmt = $db->prepare("SELECT IdPersona FROM userexternos WHERE DNI = ? LIMIT 1");
            $stmt->execute([$dni]);
            $p = $stmt->fetch();
            if ($p) $personId = (int)$p['IdPersona'];
        }

        if (!$personId) {
            $stmtInsert = $db->prepare("INSERT INTO userexternos (DNI, Nombres, Apellidos, Telefono, Direccion, IdentidadEstado) VALUES (?, ?, ?, ?, ?, ?)");
            $stmtInsert->execute([$dni, $names, $surnames, $phone, $address, $dni ? 'VALIDADA' : 'TEMPORAL']);
            $personId = (int)$db->lastInsertId();
        }

        $stmtReg = $db->prepare("
            INSERT INTO registroinfo (Fecha, IdPersona, edad, unidad_edad, MotivoOrientacion, IdTrabajador)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmtReg->execute([$date, $personId, $age, $ageUnit, $reason, $user['user_id']]);
        $regId = (int)$db->lastInsertId();

        Response::success(['id' => $regId], 'Orientación registrada con éxito', 201);
    }
}

