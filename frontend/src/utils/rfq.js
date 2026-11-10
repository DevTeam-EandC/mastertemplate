    export const newElevatorGroup = () => ({
        unit_type: "", quantity: 1, elevator_type: "", rated_capacity_kg: "", num_floors: "", num_stops: "",
        num_openings: "", machine_room_type: "", door_type: "Through", control_system: "Simplex",
      shaft_existing: "No", through_door: false, notify_department: false, mr_location: "Directly Above Shaft",
    });

    export const defaultClientForm = () => ({
      honorific: "", last_name: "", first_name: "", middle_name: "", suffix: "", contact_number: "", email_address: "",
        project_type: "Private", elevator_category: "NE", project_code: "", project_name: "", building_type: "",
        sales_id: "", account_manager_id: "", source: "", unit_type: "New unit without inspection",
      referral: "", remarks: "", quotation_purpose: "", total_qty: "",
      elevator_specs: [newElevatorGroup()],
    });

    const SKIP_WORDS = new Set(["of", "the", "and", "for", "in", "on", "at", "to", "a", "an", "by", "with", "from"]);

    export const makeCode = (s) => {
      const words = (s || "").replace(/[^a-z0-9\s]/gi, " ").trim().split(/\s+/).filter(Boolean);
      const useful = words.length > 2 ? words.filter((w) => !SKIP_WORDS.has(w.toLowerCase())) : words;
      return (useful.length > 1 ? useful.slice(0, 3).map((w) => w[0]).join("") : useful[0]?.slice(0, 3) || "")
        .toUpperCase()
        .slice(0, 3);
    };

    export const groupCodes = (g) => {
      const m = (g.unit_type || "").match(/^([A-Z]+)-(\d+)$/i);
      return Array.from({ length: Math.max(1, Number(g.quantity) || 1) }, (_, i) =>
        m
          ? `${m[1].toUpperCase()}-${String(Number(m[2]) + i).padStart(2, "0")}`
          : i === 0
          ? g.unit_type || "—"
          : `${g.unit_type}-${i + 1}`
      );
    };

    export const project_codeFor = (f, seq) =>
      `${f.project_type === "Government" ? "G" : "P"}-${f.elevator_category || "NE"}-${(f.project_code || "XX").toUpperCase()}-${new Date().getFullYear()}-${String(seq).padStart(3, "0")}`;

    export const fullName = (f) =>
      [f.honorific, f.first_name, f.middle_name, f.last_name, f.suffix].filter(Boolean).join(" ");

    export const totalAllocated = (elevator_specs) => elevator_specs.reduce((n, g) => n + (Number(g.quantity) || 0), 0);

    export const validateCustomer = (form) =>
        !form.last_name.trim() || !form.first_name.trim() || !form.contact_number.trim() || !form.email_address.trim()
        ? "Complete the required client name, contact number, and email address."
        : "";

    export const validateProject = (form) => {
      const total = Number(form.total_qty) || 0;
      const allocated = totalAllocated(form.elevator_specs);
      if (!form.project_code || !form.building_type.trim() || !form.sales_id || !form.source || !form.quotation_purpose)
        return "Complete the required project information and generate a project code.";
      if (!total || total < 1 || total > 100) return "Enter a total quantity from 1 to 100.";
      if (allocated !== total) return `Group quantities must total ${total}. Currently allocated: ${allocated}.`;
      for (let i = 0; i < form.elevator_specs.length; i++) {
        const g = form.elevator_specs[i];
          if (!g.unit_type || !g.elevator_type || !g.rated_capacity_kg || !g.num_floors || !g.num_stops || !g.num_openings || !g.machine_room_type)
          return `Complete all required fields in Group ${i + 1}.`;
      }
      return "";
    };
