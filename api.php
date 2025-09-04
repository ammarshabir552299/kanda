<?php
// Debugging enabled (disable on production if you want cleaner responses)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Allow cross-origin requests (needed for frontend)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// ✅ CHANGE THESE to match your cPanel MySQL credentials
$servername = "localhost";
$username = "kandatop_user"; // <--- CORRECT USERNAME
$password = "Ammar529@shabir"; // Make sure this is the correct password for this user
$dbname = "kandatop_abc";

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Return a JSON error message and exit
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Handle request
$request_method = $_SERVER["REQUEST_METHOD"];

switch($request_method) {
    case 'GET':
        // Fetch all or single record
        $action = $_GET['action'] ?? '';
        if ($action === 'get_single' && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("SELECT id, name, email, phone, address, created_at FROM customers WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            echo json_encode($result->fetch_assoc() ?: []);
            $stmt->close();
        } else { // 'get' action
            $sql = "SELECT id, name, email, phone, address, created_at FROM customers ORDER BY created_at DESC";
            $result = $conn->query($sql);
            $customers = [];
            while($row = $result->fetch_assoc()) {
                $customers[] = $row;
            }
            echo json_encode($customers);
        }
        break;

    case 'POST':
        // Decode JSON input from the request body
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'add') {
            $stmt = $conn->prepare("INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $data['name'], $data['email'], $data['phone'], $data['address']);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "id" => $stmt->insert_id]);
            } else {
                echo json_encode(["success" => false, "error" => $stmt->error]);
            }
            $stmt->close();

        } elseif ($action === 'update') {
            $stmt = $conn->prepare("UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $data['name'], $data['email'], $data['phone'], $data['address'], $data['id']);
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => $stmt->error]);
            }
            $stmt->close();

        } elseif ($action === 'delete') {
            $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->bind_param("i", $data['id']);
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => $stmt->error]);
            }
            $stmt->close();

        } else {
            echo json_encode(["error" => "Invalid action"]);
        }
        break;

    default:
        header("HTTP/1.0 405 Method Not Allowed");
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

// Close the database connection
$conn->close();
