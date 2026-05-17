import api from "../lib/api.ts";

export async function printClinicalNotePdf(noteId: string): Promise<void> {
  const response = await api.get(`/api/clinical-notes/${noteId}/pdf`, {
    responseType: "blob",
  });

  const contentType = response.headers["content-type"];
  if (!contentType?.includes("application/pdf")) {
    const errorText = await response.data.text();
    console.error("Server returned non-PDF response:", errorText);
    throw new Error("Failed to generate PDF for printing.");
  }

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };

    printWindow.onafterprint = () => {
      printWindow.close();
      window.URL.revokeObjectURL(url);
    };

    setTimeout(() => {
      if (!printWindow.closed) {
        window.URL.revokeObjectURL(url);
      }
    }, 10000);
    return;
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = `clinical_note_${noteId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  throw new Error("Popup was blocked. PDF downloaded instead.");
}
