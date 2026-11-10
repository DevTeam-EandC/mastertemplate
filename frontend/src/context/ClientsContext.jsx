import { createContext, useContext, useState } from "react";
import { SO_AM, initialClients } from "../data/constants";
import { fullName } from "../utils/rfq";

const ClientsContext = createContext(null);
export const useClients = () => useContext(ClientsContext);

const STORAGE_KEY = "elevate-clients";

export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialClients; }
    catch { return initialClients; }
  });
  // The most recent RFQ submitted in this session, shown on the Project overview page.
  const [lastSubmission, setLastSubmission] = useState(null);

  function addClient(form) {
    const record = {
        id: form.project_code || `EC-${String(Date.now()).slice(-5)}`,
      name: fullName(form),
        project: `${form.building_type} · ${form.unit_type || form.unit_type}`,
      officer: SO_AM[form.sales_id] || form.sales_id,
      status: form.quotation_purpose === "For Site Inspection" ? "For site inspection" : "For quotation",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        elevators: form.elevatorCount || Number(form.total_qty) || 1,
      details: form.rfqPayload || form,
    };
    const next = [record, ...clients];
    setClients(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLastSubmission(form.rfqPayload || null);
  }

  return (
    <ClientsContext.Provider value={{ clients, addClient, lastSubmission, clearLastSubmission: () => setLastSubmission(null) }}>
      {children}
    </ClientsContext.Provider>
  );
}
