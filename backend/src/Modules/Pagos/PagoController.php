<?php
namespace App\Modules\Pagos;

use App\Core\Controller;
use App\Core\Database;
use App\Middlewares\AuthMiddleware;
use App\Utils\Response;
use Exception;

class PagoController extends Controller {
    public function index(): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT 
                p.IdPago as id,
                p.IdExpediente as expedienteId,
                e.NombreExpediente as expedienteCode,
                p.NumPago as paymentNumber,
                p.Monto as amount,
                p.MontoPagado as paidAmount,
                p.FechaProgramada as dueDate,
                p.FechaPago as paidDate,
                p.EstadoPago as status,
                CONCAT(u.Nombres, ' ', u.Apellidos) as debtorName,
                u.DNI as debtorDni,
                u.Telefono as debtorPhone
            FROM pagos_realizados p
            INNER JOIN expedientes e ON p.IdExpediente = e.IdExpediente
            INNER JOIN userexternos u ON p.IdPersona = u.IdPersona
            ORDER BY p.FechaProgramada ASC
        ");

        Response::success($stmt->fetchAll());
    }

    public function markAsPaid(string $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $body = $this->getJsonBody();

        $paidDate = !empty($body['paidDate']) ? $body['paidDate'] : date('Y-m-d');
        $paidAmount = isset($body['amount']) ? (float)$body['amount'] : null;

        $db->beginTransaction();
        try {
            // 1. Obtener datos del pago actual
            $stmt = $db->prepare("SELECT IdExpediente, IdPersona, NumPago, Monto FROM pagos_realizados WHERE IdPago = ? LIMIT 1");
            $stmt->execute([(int)$id]);
            $current = $stmt->fetch();

            if (!$current) {
                Response::notFound('Pago no encontrado');
            }

            if ($paidAmount === null) {
                $paidAmount = (float)$current['Monto'];
            }

            // 2. Marcar como pagado
            $update = $db->prepare("UPDATE pagos_realizados SET EstadoPago = 'Pagado', FechaPago = ?, MontoPagado = ? WHERE IdPago = ?");
            $update->execute([$paidDate, $paidAmount, (int)$id]);

            // 3. Activar el siguiente pago como 'Próximo Pago'
            $nextNum = (int)$current['NumPago'] + 1;
            $updateNext = $db->prepare("
                UPDATE pagos_realizados 
                SET EstadoPago = 'Próximo Pago' 
                WHERE IdExpediente = ? AND IdPersona = ? AND NumPago = ? AND EstadoPago = 'Pendiente'
            ");
            $updateNext->execute([$current['IdExpediente'], $current['IdPersona'], $nextNum]);

            $db->commit();
            Response::success(null, 'Pago registrado correctamente');
        } catch (Exception $e) {
            $db->rollBack();
            Response::error('Error al registrar el pago: ' . $e->getMessage(), 500);
        }
    }

    public function revertPayment(string $id): void {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare("UPDATE pagos_realizados SET EstadoPago = 'Pendiente', FechaPago = NULL, MontoPagado = NULL WHERE IdPago = ?");
        $stmt->execute([(int)$id]);

        Response::success(null, 'Pago revertido a estado Pendiente');
    }
}

