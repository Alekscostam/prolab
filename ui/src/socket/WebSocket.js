import ReconnectingWebSocket from 'reconnecting-websocket';
import {StringUtils} from '../utils/StringUtils';
import useStore from '../store';

export default class WebSocket {
    static instance = null;

    constructor(messageHandler) {
        if (WebSocket.instance) {
            return WebSocket.instance;
        }
        WebSocket.instance = this;
        this.socket = null;
        this.connected = false;
        this.initConnection = false;
        this.messageHandler = messageHandler;
    }

    connect() {
        const url = useStore.getState().wssUrl;
        if (!StringUtils.isBlankOrEmpty(url)) {
            if (!this.initConnection) {
                console.log('WSS URL: ' + url);
                this.initConnection = true;
                if (!this.connected) {
                    this.socket = new ReconnectingWebSocket(url);
                    this.socket.addEventListener('open', () => {
                        this.connected = true;
                        this.sendMessage({
                            type: 'PING',
                            payload: {
                                userId: 123,
                                token: 'abc123',
                            },
                        });
                    });
                    this.socket.addEventListener('close', () => {
                        this.connected = false;
                    });
                    this.socket.addEventListener('message', (event) => {
                        const message = JSON.parse(event?.data);
                        // this.messageHandler(event);
                        console.log('WebSocket event:', event);
                        console.log('WebSocket message:', message);
                        // this.onMessage(message);
                    });
                    this.socket.addEventListener('error', (error) => {
                        console.error('Błąd WebSocket:', error);
                    });
                }
            }
        }
    }

    sendMessage(msg) {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify(msg));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.socket = null;
        this.initConnection = false;
        this.connected = false;
    }
}
