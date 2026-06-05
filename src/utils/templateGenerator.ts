import * as XLSX from 'xlsx';

/**
 * Downloads a prefilled XLSX template or CSV for student onboarding.
 */
export function downloadStudentTemplate() {
  const data = [
    {
      "Full Name": "Esther Akinyi",
      "Admission No": "ADM-8091",
      "Fee Balance": 32000,
      "Gender": "Female",
      "Grade Level": "Grade 5",
      "Boarding Status": "Day",
      "Parent Email": "esther.parent@example.com",
      "Parent Phone": "+254712345678"
    },
    {
      "Full Name": "Kevin Mwangi",
      "Admission No": "ADM-8092",
      "Fee Balance": 54000,
      "Gender": "Male",
      "Grade Level": "Grade 6",
      "Boarding Status": "Boarder",
      "Parent Email": "kevin.parent@example.com",
      "Parent Phone": "+254722334455"
    },
    {
      "Full Name": "Amina Juma",
      "Admission No": "ADM-8093",
      "Fee Balance": 0,
      "Gender": "Female",
      "Grade Level": "Grade 4",
      "Boarding Status": "Day",
      "Parent Email": "amina.parent@example.com",
      "Parent Phone": "+254733556677"
    },
    {
      "Full Name": "Brian Chepkwony",
      "Admission No": "ADM-8094",
      "Fee Balance": 45000,
      "Gender": "Male",
      "Grade Level": "Grade 5",
      "Boarding Status": "Boarder",
      "Parent Email": "brian.parent@example.com",
      "Parent Phone": "+254701223344"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  // Auto-fit column widths for excellent readability
  const maxProps = Object.keys(data[0]);
  ws['!cols'] = maxProps.map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(obj => (obj[key as keyof typeof obj] !== undefined ? String(obj[key as keyof typeof obj]).length : 10))
    ) + 4
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Student Onboarding");
  XLSX.writeFile(wb, "skoola_students_onboarding_template.xlsx");
}

/**
 * Downloads a prefilled XLSX template for school onboarding.
 */
export function downloadSchoolTemplate() {
  const data = [
    {
      "School Name": "Kiambu Pioneer Academy",
      "School Code": "KPA-001",
      "Curriculum": "CBE (Kenya)",
      "Email Address": "pioneer.kiambu@skoola.co.ke",
      "Phone Number": "+254711222333",
      "Physical Address": "P.O Box 12, Kiambu Central, Kenya"
    },
    {
      "School Name": "Nairobi Anglo-Cambridge School",
      "School Code": "NACS-802",
      "Curriculum": "Cambridge (International)",
      "Email Address": "admin.nairobi@anglosecondary.sc.ke",
      "Phone Number": "+254722333444",
      "Physical Address": "Langata Road, Nairobi, Kenya"
    },
    {
      "School Name": "Mombasa Elite CBE School",
      "School Code": "MES-115",
      "Curriculum": "CBE (Kenya)",
      "Email Address": "info@mombasaelite.ac.ke",
      "Phone Number": "+254733444555",
      "Physical Address": "Nyali Access Road, Mombasa"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Auto-fit column widths
  const maxProps = Object.keys(data[0]);
  ws['!cols'] = maxProps.map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(obj => (obj[key as keyof typeof obj] !== undefined ? String(obj[key as keyof typeof obj]).length : 10))
    ) + 4
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Schools Register");
  XLSX.writeFile(wb, "skoola_schools_onboarding_template.xlsx");
}

/**
 * Downloads a prefilled XLSX template for staff onboarding.
 */
export function downloadStaffTemplate() {
  const data = [
    {
      "Staff Name": "Moses Kiprop",
      "Assigned Role": "Teacher",
      "Email Address": "moses.kiprop@school.co.ke",
      "Phone Number": "+254733444555",
      "Notes": "Assigned to Grade 5 Science / Year 8 English"
    },
    {
      "Staff Name": "Serah Wanjiku",
      "Assigned Role": "Head Teacher",
      "Email Address": "serah.wanjiku@school.co.ke",
      "Phone Number": "+254722555666",
      "Notes": "Principal administrator profile with ultimate privileges"
    },
    {
      "Staff Name": "John Omondi",
      "Assigned Role": "Registrar",
      "Email Address": "john.omondi@school.co.ke",
      "Phone Number": "+254711666777",
      "Notes": "Handles finance entries and pupil fee tallies"
    },
    {
      "Staff Name": "Francis Chege",
      "Assigned Role": "Bus Driver",
      "Email Address": "francis.chege@school.co.ke",
      "Phone Number": "+254701888999",
      "Notes": "Route driver with school transit supervisor coverage"
    },
    {
      "Staff Name": "Grace Musyoka",
      "Assigned Role": "Warden",
      "Email Address": "grace.musyoka@school.co.ke",
      "Phone Number": "+254735999000",
      "Notes": "Dormitory health, behavior, and pupil welfare logs"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Auto-fit column widths
  const maxProps = Object.keys(data[0]);
  ws['!cols'] = maxProps.map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(obj => (obj[key as keyof typeof obj] !== undefined ? String(obj[key as keyof typeof obj]).length : 10))
    ) + 4
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Staff Registry");
  XLSX.writeFile(wb, "skoola_staff_onboarding_template.xlsx");
}
