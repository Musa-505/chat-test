import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '@firebase/firestore';
import { db, auth } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatScreen.css';

const ChatScreen = () => {
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const { userId } = useParams();
    const navigate = useNavigate();

    const fetchMessages = useCallback(() => {
        const messagesCollection = collection(db, 'messages');
        const q = query(messagesCollection, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
                const messageData = doc.data();
                if (
                    (messageData.senderId === auth.currentUser.uid && messageData.receiverId === userId) ||
                    (messageData.senderId === userId && messageData.receiverId === auth.currentUser.uid)
                ) {
                    fetchedMessages.push({
                        id: doc.id,
                        ...messageData,
                    });
                }
            });
            setMessages(fetchedMessages);
        });
    }, [userId]);

    useEffect(() => {
        const unsubscribe = fetchMessages();
        return () => unsubscribe();
    }, [fetchMessages]);

    const handleSendTextMessage = async () => {
        try {
            if (messageText.trim() === '') return;

            await addDoc(collection(db, 'messages'), {
                senderId: auth.currentUser.uid,
                receiverId: userId,
                messageText: messageText.trim(),
                timestamp: serverTimestamp(),
            });

            setMessageText('');
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <div className="container_chat">
            <div className="header">
                <button onClick={() => navigate('/home')} className="backButton">Назад</button>
                <h2 className="title">Chat</h2>
            </div>
            <div className="messagesContainer">
                {messages.length > 0 ? (
                    <ul className="messageList">
                        {messages.map((message) => (
                            <li key={message.id} className={message.senderId === auth.currentUser.uid ? 'sentMessageContainer' : 'receivedMessageContainer'}>
                                <div className={message.senderId === auth.currentUser.uid ? 'sentMessage' : 'receivedMessage'}>
                                    <p>{message.messageText}</p>
                                    <p className="timestamp">{message.timestamp ? new Date(message.timestamp.seconds * 1000).toLocaleString() : ''}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="emptyText">Пока нет сообщений.</p>
                )}
            </div>
            <div className="inputContainer">
                <input
                    type="text"
                    className="input"
                    placeholder="Введите ваше сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />
                <button onClick={handleSendTextMessage} className="sendButton">Отправить</button>
            </div>
        </div>
    );
};

export default ChatScreen;