import { notFound } from "next/navigation";

/** Любой неизвестный адрес внутри /ru или /en показывает локализованную страницу 404. */
export default function CatchAll() {
  notFound();
}
