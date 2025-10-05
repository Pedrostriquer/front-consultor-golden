import * as signalR from "@microsoft/signalr";

const HUB_URL = `${process.env.REACT_APP_BASE_ROUTE_HUB}dashboardHub`;

const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('authToken'),
        // ======================= INÍCIO DA CORREÇÃO =======================
        // Esta opção desativa o cache para a requisição de negociação do SignalR,
        // adicionando um timestamp único à URL a cada tentativa de conexão.
        // Isso força o navegador a sempre contatar o servidor.
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets,
        cache: "no-cache" // Opção alternativa e mais explícita
        // ======================= FIM DA CORREÇÃO =======================
    })
    .withAutomaticReconnect()
    .build();

// O resto do seu arquivo dashboardSocketService.js permanece o mesmo...

const registeredListeners = new Set();

const startConnection = async () => {
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            console.log("SignalR Conectado.");
        }
    } catch (err) {
        console.error("Falha ao conectar com SignalR:", err);
        setTimeout(startConnection, 5000);
    }
};

const stopConnection = () => {
    if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
        console.log("SignalR Desconectado.");
    }
};

const registerListener = (eventName, callback) => {
    if (!registeredListeners.has(eventName)) {
        connection.on(eventName, callback);
        registeredListeners.add(eventName);
        console.log(`Listener para '${eventName}' registrado.`);
    }
};

const clearListeners = () => {
    registeredListeners.forEach(eventName => {
        connection.off(eventName);
    });
    registeredListeners.clear();
    console.log("Todos os listeners do SignalR foram removidos.");
};

export const dashboardSocketService = {
    startConnection,
    stopConnection,
    registerListener,
    clearListeners
};