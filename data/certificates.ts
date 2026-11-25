import type { Certificate } from "./types";

// Supplied by the client as images of the issued documents.
export const certificates = [
  {
    id: "dpiit-startup-india",
    title: "certificate.dpiit.title",
    detail: "certificate.dpiit.detail",
    register: "DPIIT recognition",
    number: "certificate.dpiit.number",
    src: "/certificate/dpiit-startup-india-recognition.jpeg",
    width: 1527,
    height: 1079,
    alt: "Startup India Certificate of Recognition issued to Infintin Mobility Solutions Private Limited by the Department for Promotion of Industry and Internal Trade.",
  },
  {
    id: "udyam",
    title: "certificate.udyam.title",
    detail: "certificate.udyam.detail",
    register: "Udyam registration",
    number: "certificate.udyam.number",
    src: "/certificate/udyam-registration.jpeg",
    width: 1199,
    height: 783,
    alt: "Udyam Registration Certificate from the Ministry of Micro, Small and Medium Enterprises for Infintin Mobility Solutions Private Limited, a micro enterprise in manufacturing.",
  },
] as const satisfies readonly Certificate[];
