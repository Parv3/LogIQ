import React from 'react';

export default function PriorityZeroBanner({ safetyAlarms, maintenanceTasks }) {
  const hasAlarms = safetyAlarms && safetyAlarms.length > 0;
  const hasMaint = maintenanceTasks && maintenanceTasks.length > 0;

  const alarmText = hasAlarms
    ? `High Alert: ${safetyAlarms[0].description} | Source: ${safetyAlarms[0].alarm_id}`
    : "High Alert: Safety Interlock Triggered (Machine 2) | Source: Sensor 1A";

  const maintText = hasMaint
    ? `Unresolved Maintenance: ${maintenanceTasks[0].task_id} (${maintenanceTasks[0].component})`
    : "Unresolved Maintenance: PM Task PM-109 (Hydraulics B)";

  return (
    <div className="priority-zero-banner">
      <div className="priority-title">
        PRIORITY ZERO: SAFETY & MAINTENANCE (CRITICAL)
      </div>
      <div className="priority-item">
        <strong>{alarmText}</strong>
      </div>
      <div className="priority-item">
        <strong>{maintText}</strong>
      </div>
    </div>
  );
}
