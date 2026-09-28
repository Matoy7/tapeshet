import ReactDOM from "react-dom/client"
import "../index.css"
import { CategoryBarChart } from "@/components/ui/CategoryBarChart"
import { rampAt } from "@/lib/colorRamp"
const b = (id: string, label: string, percent: number) => ({ id, label, percent, color: rampAt(0.65 + 0.35 * (percent / 100)) })
ReactDOM.createRoot(document.getElementById("root")!).render(
  <div dir="rtl" style={{ width: 520, padding: 16, background: "#fff", margin: 20, borderRadius: 24 }}>
    <CategoryBarChart bars={[b("a", "רכב ונסיעה", 20), b("b", "בית לפני היציאה", 50), b("c", "מסמכים וחפצים חשובים", 40), b("d", "ציוד לתינוק", 100), b("e", "נמוך", 5)]} />
  </div>,
)
