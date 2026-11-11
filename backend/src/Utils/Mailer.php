<?php
namespace App\Utils;

use Exception;

class Mailer {
    /**
     * Enviar correo electrónico mediante SMTP con socket nativo (sin dependencias externas).
     *
     * @param string $toEmail Destinatario
     * @param string $toName Nombre del destinatario
     * @param string $subject Asunto del correo
     * @param string $htmlBody Contenido en HTML
     * @return bool
     * @throws Exception
     */
    public static function send(string $toEmail, string $toName, string $subject, string $htmlBody): bool {
        $host = getenv('MAIL_HOST') ?: ($_ENV['MAIL_HOST'] ?? 'mail.popydev.com');
        $port = (int)(getenv('MAIL_PORT') ?: ($_ENV['MAIL_PORT'] ?? 465));
        $user = getenv('MAIL_USERNAME') ?: ($_ENV['MAIL_USERNAME'] ?? 'datossistema@popydev.com');
        $pass = getenv('MAIL_PASSWORD') ?: ($_ENV['MAIL_PASSWORD'] ?? 'Piero2004@');
        $encryption = strtolower(getenv('MAIL_ENCRYPTION') ?: ($_ENV['MAIL_ENCRYPTION'] ?? 'ssl'));
        $fromEmail = getenv('MAIL_FROM_ADDRESS') ?: ($_ENV['MAIL_FROM_ADDRESS'] ?? 'datossistema@popydev.com');
        $fromName = getenv('MAIL_FROM_NAME') ?: ($_ENV['MAIL_FROM_NAME'] ?? 'DEMUNA Perú - Sistema de Gestión');

        $protocol = ($encryption === 'ssl' || $port === 465) ? 'ssl://' : '';
        $socketHost = $protocol . $host;

        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ]
        ]);

        $socket = @stream_socket_client(
            $socketHost . ':' . $port,
            $errno,
            $errstr,
            15,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$socket) {
            throw new Exception("No se pudo conectar al servidor SMTP {$socketHost}:{$port} - {$errstr} ({$errno})");
        }

        stream_set_timeout($socket, 15);

        // 1. Leer saludo inicial
        self::expectResponse($socket, [220]);

        // 2. Saludo EHLO
        self::sendCommand($socket, "EHLO " . gethostname());
        self::expectResponse($socket, [250]);

        // 3. Autenticación AUTH LOGIN
        self::sendCommand($socket, "AUTH LOGIN");
        self::expectResponse($socket, [334]);

        self::sendCommand($socket, base64_encode($user));
        self::expectResponse($socket, [334]);

        self::sendCommand($socket, base64_encode($pass));
        self::expectResponse($socket, [235], "Error de autenticación SMTP con el usuario {$user}");

        // 4. Remitente y Destinatario
        self::sendCommand($socket, "MAIL FROM:<{$fromEmail}>");
        self::expectResponse($socket, [250]);

        self::sendCommand($socket, "RCPT TO:<{$toEmail}>");
        self::expectResponse($socket, [250, 251]);

        // 5. Iniciar bloque de datos
        self::sendCommand($socket, "DATA");
        self::expectResponse($socket, [354]);

        // 6. Cabeceras MIME
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
        $encodedToName = '=?UTF-8?B?' . base64_encode($toName) . '?=';

        $headers = [];
        $headers[] = "Date: " . date('r');
        $headers[] = "From: {$encodedFromName} <{$fromEmail}>";
        $headers[] = "To: {$encodedToName} <{$toEmail}>";
        $headers[] = "Subject: {$encodedSubject}";
        $headers[] = "Message-ID: <" . md5(uniqid(microtime(), true)) . "@" . $host . ">";
        $headers[] = "X-Mailer: PHP/SistDEMUNA-2.0";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        $headers[] = "Content-Transfer-Encoding: 8bit";

        $data = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
        self::sendCommand($socket, $data);
        self::expectResponse($socket, [250], "El servidor SMTP no aceptó el cuerpo del mensaje");

        // 7. Desconexión limpia
        self::sendCommand($socket, "QUIT");
        @fclose($socket);

        return true;
    }

    private static function sendCommand($socket, string $command): void {
        fputs($socket, $command . "\r\n");
    }

    private static function expectResponse($socket, array $validCodes, string $errorMessage = ""): string {
        $response = "";
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            // Si la línea tiene formato 'XYZ ' (código seguido de espacio), terminó el bloque
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        $code = (int)substr($response, 0, 3);
        if (!in_array($code, $validCodes, true)) {
            $detail = trim($response);
            $msg = $errorMessage ? "{$errorMessage}: {$detail}" : "Error SMTP ({$code}): {$detail}";
            throw new Exception($msg);
        }

        return $response;
    }

    /**
     * Plantilla de correo HTML institucional en diseño Dark Tech / DEMUNA
     */
    public static function buildPasswordResetTemplate(string $name, string $code, string $resetLink, int $minutesExp = 15): string {
        return '
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña - DEMUNA Perú</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0C0D22; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #F5F4FF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0C0D22; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #191731; border: 1px solid #373351; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(2, 3, 14, 0.6);">
          
          <!-- Cabecera -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #191731 0%, #15132A 100%); border-bottom: 1px solid #373351; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #211F3D; border: 1px solid #6C3AED; padding: 10px 20px; border-radius: 12px; margin-bottom: 12px;">
                      <span style="color: #F5F4FF; font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">Sistema DEMUNA <span style="color: #FFC36C;">Perú</span></span>
                    </div>
                    <p style="margin: 0; color: #B8B7D0; font-size: 13px;">Defensoría Municipal del Niño y del Adolescente</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 12px; color: #FFFFFF; font-size: 20px; font-weight: 700;">Recuperación de Acceso Institucional</h2>
              <p style="margin: 0 0 20px; color: #B8B7D0; font-size: 14px; line-height: 1.6;">
                Hola <strong>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</strong>, hemos recibido una solicitud para restablecer la contraseña de tu cuenta institucional en la plataforma DEMUNA.
              </p>

              <!-- Tarjeta con Código de 6 Dígitos -->
              <div style="background-color: #15132A; border: 1px dashed #6C3AED; border-radius: 14px; padding: 25px 20px; text-align: center; margin: 25px 0;">
                <span style="display: block; color: #2FAAF7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Tu código de seguridad de 6 dígitos:</span>
                <span style="display: inline-block; font-size: 36px; font-weight: 800; color: #FFC36C; letter-spacing: 8px; font-family: monospace;">' . htmlspecialchars($code, ENT_QUOTES, 'UTF-8') . '</span>
                <p style="margin: 10px 0 0; color: #918CA9; font-size: 12px;">Válido únicamente durante los próximos <strong>' . $minutesExp . ' minutos</strong>.</p>
              </div>

              <p style="margin: 0 0 25px; color: #B8B7D0; font-size: 14px; line-height: 1.6;">
                Puedes ingresar este código en la pantalla de recuperación o hacer clic directamente en el siguiente botón seguro para cambiar tu contraseña:
              </p>

              <!-- Botón CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="' . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . '" style="display: inline-block; background: linear-gradient(135deg, #814EFF 0%, #6C3AED 100%); color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(108, 58, 237, 0.4);">
                  Restablecer Contraseña Ahora &rarr;
                </a>
              </div>

              <!-- Enlace plano de respaldo -->
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #292546; font-size: 12px; color: #918CA9; line-height: 1.5; word-break: break-all;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="' . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . '" style="color: #2FAAF7; text-decoration: underline;">' . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . '</a>
              </div>

              <!-- Aviso de seguridad -->
              <div style="margin-top: 30px; background-color: #211F3D; border-left: 3px solid #2FAAF7; padding: 12px 16px; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; color: #B8B7D0;">
                  🔒 <strong>Aviso de seguridad:</strong> Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no cambiará hasta que se verifique el código.
                </p>
              </div>
            </td>
          </tr>

          <!-- Pie de correo -->
          <tr>
            <td style="padding: 20px 40px; background-color: #15132A; border-top: 1px solid #373351; text-align: center; font-size: 11px; color: #918CA9;">
              <p style="margin: 0 0 4px;">Defensoría Municipal del Niño, Niña y Adolescente &bull; DEMUNA ZAPILLICA &bull; Municipalidad Distrital de Zapillica</p>
              <p style="margin: 0;">Plataforma Institucional Segura &bull; MIMP Perú &copy; ' . date('Y') . '</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
';
    }
}

