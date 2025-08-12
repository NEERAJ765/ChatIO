import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const Chatcontext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    const getUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("/api/messages/users", { headers: { token } });
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.messages);
        }
    }

    //function to get messages for selected user

    const getMessages = async (userId) => {
        if (!userId) return;
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to sdend the message to selected user

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [
                    ...prevMessages, data.newMessage
                ])
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe for selected user

    const subscribeToMessages = async () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId] ?
                            prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //function to uunsubscribe from messages

    const unSubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    }
    useEffect(() => {
        if (socket) {
            subscribeToMessages();
        }
        return () => {
            if (socket) unSubscribeFromMessages();
        };
    }, [socket, selectedUser]);

    const { authUser } = useContext(AuthContext);

    useEffect(() => {
        if (authUser) {
            getUsers();
        }
    }, [authUser]);

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }
    return (
        <Chatcontext.Provider value={value}>
            {children}
        </Chatcontext.Provider>
    )
}