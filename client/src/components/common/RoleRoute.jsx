import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, initialized } = useAuthStore();

    // Wait for auth initialization
    if (!initialized) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        return (
            <div className="py-10 text-center">
                <h2 className="text-xl font-semibold mb-2">403 - Forbidden</h2>
                <p className="text-slate-400 text-sm">
                    You do not have permission to access this page.
                </p>
            </div>
        );
    }

    return children;
};

export default RoleRoute;