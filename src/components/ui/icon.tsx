import {
  Archive,
  Ban,
  CalendarClock,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleMinus,
  CirclePause,
  CircleX,
  Clock,
  EyeOff,
  FlaskConical,
  Hourglass,
  LoaderCircle,
  Lock,
  Rocket,
  Scale,
  Send,
  Shield,
  TriangleAlert,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/status";

const MAP: Record<IconName, LucideIcon> = {
  check: CircleCheck,
  x: CircleX,
  alert: TriangleAlert,
  dashed: CircleDashed,
  minus: CircleMinus,
  clock: Clock,
  ban: Ban,
  flask: FlaskConical,
  hourglass: Hourglass,
  loader: LoaderCircle,
  lock: Lock,
  rocket: Rocket,
  calendar: CalendarClock,
  "eye-off": EyeOff,
  pause: CirclePause,
  dot: CircleDot,
  shield: Shield,
  undo: Undo2,
  archive: Archive,
  scale: Scale,
  send: Send,
};

export function StatusIcon({ name, className, size = 14 }: { name: IconName; className?: string; size?: number }) {
  const Icon = MAP[name];
  return <Icon aria-hidden="true" focusable="false" size={size} strokeWidth={2.25} className={className} />;
}
