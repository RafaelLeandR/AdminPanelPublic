import { MessageCircle } from "lucide-react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/5543991519069?text=Olá,%20preciso%20de%20ajuda"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999999,
        background: "#25D366",
        color: "white",
        padding: "14px 18px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        textDecoration: "none",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      <MessageCircle size={22} />
      Pedir ajuda
    </a>
  );
}