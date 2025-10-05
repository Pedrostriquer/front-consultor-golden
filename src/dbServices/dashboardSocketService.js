import * as signalR from "@microsoft/signalr";

// A URL do seu Hub, baseada no Program.cs e no .env
// ATENÇÃO: A URL base do .env não deve ter "/api/" no final para esta URL funcionar.
// Se REACT_APP_BASE_ROUTE for http://192.168.3.9:6001/api/, ajuste para http://192.168.3.9:6001/
const HUB_URL = `${process.env.REACT_APP_BASE_ROUTE_HUB}dashboardHub`;

// Cria a instância da conexão
const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
        // Factory para fornecer o token de autenticação a cada requisição do Hub
        accessTokenFactory: () => {
            return localStorage.getItem('authToken');
        }
    })
    .withAutomaticReconnect() // Tenta reconectar automaticamente se a conexão cair
    .build();

// Função para iniciar a conexão
const startConnection = async () => {
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            console.log("SignalR Conectado.");
        }
    } catch (err) {
        console.error("Falha ao conectar com SignalR:", err);
        // Tenta reconectar em 5 segundos
        setTimeout(startConnection, 5000);
    }
};

// Função para parar a conexão
const stopConnection = () => {
    if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
        console.log("SignalR Desconectado.");
    }
};

// Função genérica para registrar ouvintes de eventos
const registerListener = (eventName, callback) => {
    connection.on(eventName, callback);
};

export const dashboardSocketService = {
    startConnection,
    stopConnection,
    registerListener
};