import { GlobalWorkerOptions } from "pdfjs-dist";
import { version } from "pdfjs-dist/package.json";

if (typeof window !== "undefined" && "Worker" in window) {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
}
