import {useCallback, useState} from 'react';
import OpenAI from 'openai';
import {CustomStore, DataSource} from 'devextreme-react/common/data';
import {ALERT_TIMEOUT, assistant, AzureOpenAIConfig, REGENERATION_TEXT} from './data.js';
import useStore from '../../../store.js';

const chatService = new OpenAI({
    apiKey: AzureOpenAIConfig.apiKey,
    baseURL: AzureOpenAIConfig.endpoint,
    dangerouslyAllowBrowser: true,
});
const wait = (delay) =>
    new Promise((resolve) => {
        setTimeout(resolve, delay);
    });

export async function getAIResponse(messages, delay) {
    const response = await fetch(useStore.getState().chatAi?.API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages,
            model: useStore.getState().chatAi?.MODEL,
            max_tokens: 1000,
            temperature: 0.7,
        }),
    });

    const data = await response.json();

    if (delay) {
        await wait(delay);
    }

    return data?.choices?.[0]?.message?.content ?? '';
}

const store = [];
const customStore = new CustomStore({
    key: 'id',
    load: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([...store]);
            }, 0);
        }),
    insert: (message) =>
        new Promise((resolve) => {
            setTimeout(() => {
                store.push(message);
                resolve(message);
            });
        }),
});
export const dataSource = new DataSource({
    store: customStore,
    paginate: false,
});
const dataItemToMessage = (item) => ({
    role: item.author?.id,
    content: item.text,
});
const getMessageHistory = () => [...dataSource.items()].map(dataItemToMessage);
export const useApi = () => {
    const [alerts, setAlerts] = useState([]);
    const insertMessage = useCallback((data) => {
        dataSource.store().push([{type: 'insert', data}]);
    }, []);
    const updateLastMessageContent = useCallback((text) => {
        const lastMessage = dataSource.items().at(-1);
        dataSource.store().push([
            {
                type: 'update',
                key: lastMessage.id,
                data: {text},
            },
        ]);
    }, []);
    const alertLimitReached = useCallback(() => {
        setAlerts([
            {
                message: 'Request limit reached, try again in a minute.',
            },
        ]);
        setTimeout(() => {
            setAlerts([]);
        }, ALERT_TIMEOUT);
    }, []);
    const fetchAIResponse = useCallback(
        async (message) => {
            const messages = [...getMessageHistory(), dataItemToMessage(message)];
            try {
                const aiResponse = await getAIResponse(messages, 200);
                insertMessage({
                    id: Date.now(),
                    timestamp: new Date(),
                    author: assistant,
                    text: aiResponse,
                });
            } catch {
                alertLimitReached();
            }
        },
        [alertLimitReached, insertMessage]
    );
    const regenerateLastAIResponse = useCallback(async () => {
        const messageHistory = getMessageHistory();
        updateLastMessageContent(REGENERATION_TEXT);
        try {
            const aiResponse = await getAIResponse(messageHistory.slice(0, -1));
            if (typeof aiResponse === 'string') {
                updateLastMessageContent(aiResponse);
            }
        } catch {
            updateLastMessageContent(messageHistory.at(-1)?.content);
            alertLimitReached();
        }
    }, [alertLimitReached, updateLastMessageContent]);
    return {
        alerts,
        insertMessage,
        fetchAIResponse,
        regenerateLastAIResponse,
    };
};
