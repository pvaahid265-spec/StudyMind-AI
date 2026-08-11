import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PageHeader({ title }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">

      <button
        onClick={() => navigate(-1)}
        className="
        flex items-center
        gap-2
        bg-white
        px-5
        py-3
        rounded-xl
        shadow-md
        hover:shadow-lg
        hover:-translate-y-1
        transition
        "
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl md:text-4xl font-bold text-center flex-1">
        {title}
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="
        flex items-center
        gap-2
        bg-gradient-to-r
        from-indigo-600
        to-purple-600
        text-white
        px-5
        py-3
        rounded-xl
        shadow-md
        hover:shadow-lg
        hover:scale-105
        transition
        "
      >
        <Home size={20} />
        Dashboard
      </button>

    </div>
  );
}

export default PageHeader;