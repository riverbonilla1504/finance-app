import { ImStatsBars } from "react-icons/im";

export default function Navigation() {
    return (
        <main className="font-poppins bg-background">
            <header className="flex items-center justify-between container max-w-2xl p-6 mx-auto">
                <span className="flex items-center gap-2">
                    <figure className="h-10 w-10 rounded-full overflow-hidden border-2 border-border">
                        <img
                            src="/fototomas.jpg"
                            alt="river"
                            className="object-cover h-full w-full"
                        />
                    </figure>
                    <small className="text-secondary">Hi, Tomas</small>
                </span>
                <nav className="flex items-center gap-4">
                    <span className="p-2 rounded-md bg-card hover:bg-primary transition-colors duration-200">
                        <ImStatsBars className="text-xl text-primary-foreground" />
                    </span>
                </nav>
            </header>
        </main>
    );
}