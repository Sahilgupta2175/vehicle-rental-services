import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <span className="text-sm text-slate-400">Checking session...</span>
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