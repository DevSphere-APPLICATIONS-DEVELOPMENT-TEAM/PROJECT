import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

type Props = {
  dateValue: string; // YYYY-MM-DD
  timeValue: string; // HH:mm
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
};

// ─── Web-only: native HTML inputs ───────────────────────────────────
function WebDateInput({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min: string;
}) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        fontSize: 11,
        color: "#333",
        border: "none",
        outline: "none",
        background: "transparent",
        paddingTop: 10,
        paddingBottom: 10,
        fontFamily: "inherit",
      }}
    />
  );
}

function WebTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        fontSize: 11,
        color: "#333",
        border: "none",
        outline: "none",
        background: "transparent",
        paddingTop: 10,
        paddingBottom: 10,
        fontFamily: "inherit",
      }}
    />
  );
}

// ─── Mobile-only: Picker-based modal selectors ──────────────────────
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ["AM", "PM"];

function MobileDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [selYear, setSelYear] = useState(
    value ? Number(value.split("-")[0]) : currentYear
  );
  const [selMonth, setSelMonth] = useState(
    value ? Number(value.split("-")[1]) : now.getMonth() + 1
  );
  const [selDay, setSelDay] = useState(
    value ? Number(value.split("-")[2]) : now.getDate()
  );

  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const pad = (n: number) => String(n).padStart(2, "0");

  const displayText = value
    ? `${value.split("-")[2]}/${value.split("-")[1]}/${value.split("-")[0]}`
    : "Select departure date";

  return (
    <>
      <TouchableOpacity
        style={styles.mobileTrigger}
        onPress={() => setShowModal(true)}
      >
        <Text
          style={[styles.mobileTriggerText, !value && styles.placeholderText]}
        >
          {displayText}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Departure Date</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Day</Text>
                <Picker
                  selectedValue={selDay}
                  onValueChange={(v: number) => setSelDay(v)}
                  style={styles.picker}
                >
                  {days.map((d) => (
                    <Picker.Item key={d} label={String(d)} value={d} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Month</Text>
                <Picker
                  selectedValue={selMonth}
                  onValueChange={(v: number) => setSelMonth(v)}
                  style={styles.picker}
                >
                  {months.map((m) => (
                    <Picker.Item key={m} label={pad(m)} value={m} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Year</Text>
                <Picker
                  selectedValue={selYear}
                  onValueChange={(v: number) => setSelYear(v)}
                  style={styles.picker}
                >
                  {years.map((y) => (
                    <Picker.Item key={y} label={String(y)} value={y} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                const day = Math.min(selDay, daysInMonth);
                onChange(`${selYear}-${pad(selMonth)}-${pad(day)}`);
                setShowModal(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MobileTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const parseInitial = () => {
    if (!value) return { h: 8, m: 0, p: "AM" as string };
    const hh24 = Number(value.split(":")[0]);
    const mm = Number(value.split(":")[1]);
    const p = hh24 >= 12 ? "PM" : "AM";
    let h = hh24 % 12;
    if (h === 0) h = 12;
    return { h, m: mm, p };
  };

  const init = parseInitial();
  const [selHour, setSelHour] = useState(init.h);
  const [selMin, setSelMin] = useState(init.m);
  const [selPeriod, setSelPeriod] = useState(init.p);

  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDisplay = () => {
    if (!value) return "Select departure time";
    const { h, m, p } = parseInitial();
    return `${h}:${pad(m)} ${p}`;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.mobileTrigger}
        onPress={() => {
          const cur = parseInitial();
          setSelHour(cur.h);
          setSelMin(cur.m);
          setSelPeriod(cur.p);
          setShowModal(true);
        }}
      >
        <Text
          style={[styles.mobileTriggerText, !value && styles.placeholderText]}
        >
          {formatDisplay()}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Departure Time</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <Picker
                  selectedValue={selHour}
                  onValueChange={(v: number) => setSelHour(v)}
                  style={styles.picker}
                >
                  {HOURS.map((h) => (
                    <Picker.Item key={h} label={String(h)} value={h} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Min</Text>
                <Picker
                  selectedValue={selMin}
                  onValueChange={(v: number) => setSelMin(v)}
                  style={styles.picker}
                >
                  {MINUTES.map((m) => (
                    <Picker.Item key={m} label={pad(m)} value={m} />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>AM/PM</Text>
                <Picker
                  selectedValue={selPeriod}
                  onValueChange={(v: string) => setSelPeriod(v)}
                  style={styles.picker}
                >
                  {PERIODS.map((p) => (
                    <Picker.Item key={p} label={p} value={p} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                let hh24 = selHour;
                if (selPeriod === "PM" && hh24 !== 12) hh24 += 12;
                if (selPeriod === "AM" && hh24 === 12) hh24 = 0;
                onChange(`${pad(hh24)}:${pad(selMin)}`);
                setShowModal(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Main exported component ────────────────────────────────────────
export default function DeparturePicker({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
}: Props) {
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <View>
      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>📅</Text>
        {Platform.OS === "web" ? (
          <WebDateInput
            value={dateValue}
            onChange={onDateChange}
            min={minDate}
          />
        ) : (
          <MobileDatePicker value={dateValue} onChange={onDateChange} />
        )}
      </View>

      <View style={styles.separator} />

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>🕒</Text>
        {Platform.OS === "web" ? (
          <WebTimeInput value={timeValue} onChange={onTimeChange} />
        ) : (
          <MobileTimePicker value={timeValue} onChange={onTimeChange} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 43,
    paddingHorizontal: 8,
  },
  inputIcon: {
    width: 27,
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5DCD6",
    marginLeft: 9,
  },
  mobileTrigger: {
    flex: 1,
    paddingVertical: 10,
  },
  mobileTriggerText: {
    fontSize: 11,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 35,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 15,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerCol: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  picker: {
    width: "100%",
    height: 150,
  },
  confirmButton: {
    backgroundColor: "#FF781F",
    height: 44,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#777",
    fontSize: 13,
  },
});
