import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const useSocket = () => {
    const { user } = useAuthStore();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        const token = localStorage.getItem("vr_token");
        const socket = io(SOCKET_URL, {
            auth: { token },
        });

        socketRef.current = socket;

        socket.on("connect", () => {
        // join rooms
            socket.emit("join", { userId: user._id, role: user.role });
        });

        socket.on("booking:new", (payload) => {
            toast.info(`New booking created for ${payload.vehicleName}`);
        });

        socket.on("booking:update", (payload) => {
            toast.info(`Booking updated: ${payload.status}`);
        });

        socket.on("payment:success", () => {
            toast.success("Payment confirmed!");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return socketRef;
};

export default useSocket;
