import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CURRENT_TRAINEE } from "@/constants/navigation";

export function NavUser() {
  return (
    <div className="flex items-center gap-2.5" data-testid="nav-user">
      <Avatar className="after:border-transparent">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {CURRENT_TRAINEE.initials}
        </AvatarFallback>
      </Avatar>
      <p className="hidden text-sm font-medium sm:block">
        {CURRENT_TRAINEE.name}
      </p>
    </div>
  );
}
