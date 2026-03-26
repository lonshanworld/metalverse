import { EventCreateProvider } from "./EventCreateContext";

export default function EventCreateLayout({ children }: { children: React.ReactNode }) {
  return <EventCreateProvider>{children}</EventCreateProvider>;
}
