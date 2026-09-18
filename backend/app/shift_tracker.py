from typing import Dict, List
from app.models import ShiftPayload, OperatorNote, MaintenanceTask, MachineAlarm

class ShiftTrackerEngine:
    """
    Manages state across multiple shifts and carries unresolved items forward.
    """
    def __init__(self):
        self._history: Dict[str, ShiftPayload] = {}
        self._carried_notes: List[OperatorNote] = []
        self._carried_maintenance: List[MaintenanceTask] = []
        self._carried_alarms: List[MachineAlarm] = []

    def carry_forward_to_next(self, current_payload: ShiftPayload, next_payload: ShiftPayload) -> ShiftPayload:
        """
        Extracts unresolved notes, mandatory maintenance, and active safety alarms from current_payload
        and injects them into next_payload.
        """
        # Save current payload in history
        self._history[current_payload.shift_id] = current_payload

        # Extract unresolved operator notes
        unresolved_notes = [
            OperatorNote(
                note_id=f"CARRIED-{n.note_id}",
                timestamp=f"Carried from {current_payload.shift_id} ({n.timestamp})",
                operator=f"{n.operator} [Prev Shift]",
                text=f"[CARRIED FORWARD] {n.text}",
                is_unresolved=True,
                category=n.category
            )
            for n in current_payload.operator_notes if n.is_unresolved
        ]

        # Extract unresolved mandatory maintenance
        unresolved_maint = [
            MaintenanceTask(
                task_id=f"CARRIED-{m.task_id}",
                component=m.component,
                priority=m.priority,
                description=f"[CARRIED FORWARD from {current_payload.shift_id}] {m.description}",
                is_mandatory=m.is_mandatory,
                status=m.status
            )
            for m in current_payload.maintenance_tasks if m.status != "RESOLVED"
        ]

        # Extract unresolved safety alarms
        unresolved_alarms = [
            MachineAlarm(
                alarm_id=f"CARRIED-{a.alarm_id}",
                severity=a.severity,
                description=f"[ACTIVE UNRESOLVED - Prev Shift {current_payload.shift_id}] {a.description}",
                timestamp=a.timestamp,
                is_safety_critical=a.is_safety_critical,
                resolved=False
            )
            for a in current_payload.alarms if not a.resolved
        ]

        # Combine into next_payload without duplicates
        existing_note_texts = {n.text for n in next_payload.operator_notes}
        for note in unresolved_notes:
            if note.text not in existing_note_texts:
                next_payload.operator_notes.append(note)

        existing_maint_ids = {m.task_id for m in next_payload.maintenance_tasks}
        for maint in unresolved_maint:
            if maint.task_id not in existing_maint_ids:
                next_payload.maintenance_tasks.append(maint)

        existing_alarm_ids = {a.alarm_id for a in next_payload.alarms}
        for alarm in unresolved_alarms:
            if alarm.alarm_id not in existing_alarm_ids:
                next_payload.alarms.append(alarm)

        return next_payload

tracker_instance = ShiftTrackerEngine()
