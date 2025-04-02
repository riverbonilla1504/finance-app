import { ImStatsBars } from "react-icons/im";
export default function Navigation() {
    return (
        <main className="font-poppins">
            <header className="flex items-center justify-between container max-w-2xl p-6 mx-auto">
                <span className="flex items-center gap-2">
                    <figure className="h-10 w-10 rounded-full overflow-hidden">
                        <img src="/fototomas.jpg" alt="river" />
                    </figure>
                    <small>Hi, Tomas</small>
                </span>
                <nav className="flex items-center gap-4">
                    <span>
                        <ImStatsBars className="text-2xl" />
                    </span>
                    <span>

                    </span>
                </nav>
            </header>
        </main>
    );
}