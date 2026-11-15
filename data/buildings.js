// Wat Pa Pradu School - Building Data
// Room numbering: Building + Floor + Room (e.g. Building 1, Floor 3, Room 2 = 132)

const BUILDINGS = [
  {
    id: "b1",
    name: "อาคาร 1",
    nameEn: "Building 1",
    color: "#fc2626",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "b1f1r1", name: "โถงทำกิจกรรม", type: "activity" },
          { id: "b1f1r2", name: "ห้องน้ำชา", type: "other" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "b1f2r1", name: "ติดต่อสอบถามกลุ่มอำนวยการ", type: "office" },
          { id: "b1f2r2", name: "ห้องผู้บริหาร", type: "office" },
          { id: "b1f2r3", name: "กลุ่มบริหารงบประมาณ", type: "office" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 3",
        rooms: [
          { id: "b1f3r1", name: "ห้องกลุ่มบริหารบุคคล", type: "office" },
          { id: "b1f3r2", name: "ห้องช่องทางธรรมชาติ", type: "other" },
          { id: "b1f3r3", name: "ห้องพักผ่อน", type: "other" },
          { id: "b1f3r4", name: "ห้องพักครู 1", type: "teacher" },
          { id: "b1f3r5", name: "ห้องพักครู 2", type: "teacher" },
          { id: "131", number: "131", name: "ห้องวิทยาศาสตร์", type: "science" },
          { id: "132", number: "132", name: "ห้องวิทยาศาสตร์", type: "science" },
          { id: "133", number: "133", name: "", type: "classroom" },
          { id: "134", number: "134", name: "", type: "classroom" },
          { id: "135", number: "135", name: "", type: "classroom" }
        ]
      },
      {
        floor: 4,
        label: "ชั้น 4",
        rooms: [
          { id: "141", number: "141", name: "", type: "classroom" },
          { id: "142", number: "142", name: "", type: "classroom" },
          { id: "143", number: "143", name: "", type: "classroom" },
          { id: "144", number: "144", name: "", type: "classroom" },
          { id: "145", number: "145", name: "", type: "classroom" }
        ]
      },
      {
        floor: 5,
        label: "ชั้น 5",
        rooms: [
          { id: "151", number: "151", name: "ม.6/2", type: "classroom" },
          { id: "152", number: "152", name: "ม.6/3", type: "classroom" },
          { id: "153", number: "153", name: "ม.6/4", type: "classroom" },
          { id: "154", number: "154", name: "ม.6/5", type: "classroom" },
          { id: "b1f5r5", name: "Chinese - Japanese Center", type: "special" },
          { id: "155", number: "155", name: "ม.6/6", type: "classroom" },
          { id: "156", number: "156", name: "ม.6/7", type: "classroom" },
          { id: "157", number: "157", name: "ม.6/8", type: "classroom" },
          { id: "b1f5r9", name: "Teachers Room", type: "teacher" }
        ]
      },
      {
        floor: 6,
        label: "ชั้น 6",
        rooms: [
          { id: "161", number: "161", name: "ม.5/2", type: "classroom" },
          { id: "162", number: "162", name: "ม.5/3", type: "classroom" },
          { id: "163", number: "163", name: "ม.5/4", type: "classroom" },
          { id: "164", number: "164", name: "ม.5/5", type: "classroom" },
          { id: "165", number: "165", name: "ม.5/6", type: "classroom" },
          { id: "166", number: "166", name: "ม.5/7", type: "classroom" },
          { id: "167", number: "167", name: "ม.5/8", type: "classroom" },
          { id: "168", number: "168", name: "ม.5/9", type: "classroom" }
        ]
      },
      {
        floor: 7,
        label: "ชั้น 7",
        rooms: [
          { id: "171", number: "171", name: "IDP", type: "special" },
          { id: "172", number: "172", name: "IDP", type: "special" },
          { id: "173", number: "173", name: "IDP", type: "special" },
          { id: "174", number: "174", name: "ม.4/2", type: "classroom" },
          { id: "175", number: "175", name: "ม.4/1", type: "classroom" },
          { id: "176", number: "176", name: "ม.5/7", type: "classroom" },
          { id: "177", number: "177", name: "ม.6/1", type: "classroom" }
        ]
      },
      {
        floor: 8,
        label: "ชั้น 8",
        rooms: [
          { id: "181", number: "181", name: "ม.1/1", type: "classroom" },
          { id: "182", number: "182", name: "ม.1/2", type: "classroom" },
          { id: "183", number: "183", name: "ม.2/1", type: "classroom" },
          { id: "184", number: "184", name: "ม.2/4", type: "classroom" },
          { id: "185", number: "185", name: "ม.3/1", type: "classroom" },
          { id: "186", number: "186", name: "ม.3/2", type: "classroom" },
          { id: "b1f8r7", name: "ห้องเกียรติยศ พระเทพคุณาธาร(อภโย ป.ธ.๔)", type: "special" }
        ]
      }
    ]
  },
  {
    id: "b2",
    name: "อาคาร 2",
    nameEn: "Building 2",
    color: "#ff9e2f",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "b2f1r1", name: "ห้องประชาสัมพันธ์", type: "office" },
          { id: "b2f1r2", name: "ห้องเฉลิมพระเกียรติ", type: "special" },
          { id: "b2f1r3", name: "ห้องปฐมพยาบาล", type: "medical" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "221", number: "221", name: "กลุ่มสาระการเรียนรู้ภาษาไทย", type: "office" },
          { id: "222", number: "222", name: "ม.1/5", type: "classroom" },
          { id: "223", number: "223", name: "ม.1/6", type: "classroom" },
          { id: "224", number: "224", name: "ม.1/7", type: "classroom" },
          { id: "225", number: "225", name: "ม.1/8", type: "classroom" },
          { id: "226", number: "226", name: "ม.1/9", type: "classroom" },
          { id: "227", number: "227", name: "ม.1/10", type: "classroom" },
          { id: "228", number: "228", name: "ม.1/11", type: "classroom" },
          { id: "229", number: "229", name: "ม.1/12", type: "classroom" },
          { id: "2210", number: "2210", name: "ม.1/13", type: "classroom" },
          { id: "2211", number: "2211", name: "ม.1/14", type: "classroom" },
          { id: "2212", number: "2212", name: "ม.1/15", type: "classroom" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 3",
        rooms: [
          { id: "231", number: "231", name: "กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม", type: "office" },
          { id: "232", number: "232", name: "ม.1/16", type: "classroom" },
          { id: "233", number: "233", name: "ม.2/5", type: "classroom" },
          { id: "234", number: "234", name: "ม.2/6", type: "classroom" },
          { id: "235", number: "235", name: "ม.2/7", type: "classroom" },
          { id: "236", number: "236", name: "ม.2/8", type: "classroom" },
          { id: "237", number: "237", name: "ม.2/9", type: "classroom" },
          { id: "238", number: "238", name: "ม.2/10", type: "classroom" },
          { id: "239", number: "239", name: "ม.2/11", type: "classroom" },
          { id: "2310", number: "2310", name: "ม.2/12", type: "classroom" },
          { id: "2311", number: "2311", name: "ม.2/13", type: "classroom" },
          { id: "2312", number: "2312", name: "ศูนย์การเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม", type: "special" }
        ]
      },
      {
        floor: 4,
        label: "ชั้น 4",
        rooms: [
          { id: "241", number: "241", name: "ศูนย์การเรียนรู้วิทยาศาสตร์", type: "science" },
          { id: "242", number: "242", name: "ม.2/14", type: "classroom" },
          { id: "243", number: "243", name: "ม.2/15", type: "classroom" },
          { id: "244", number: "244", name: "ม.2/16", type: "classroom" },
          { id: "245", number: "245", name: "ม.3/5", type: "classroom" },
          { id: "246", number: "246", name: "ม.3/6", type: "classroom" },
          { id: "247", number: "247", name: "ม.3/7", type: "classroom" },
          { id: "248", number: "248", name: "ม.3/8", type: "classroom" },
          { id: "249", number: "249", name: "ม.3/9", type: "classroom" },
          { id: "2410", number: "2410", name: "ม.3/10", type: "classroom" },
          { id: "2411", number: "2411", name: "ม.3/11", type: "classroom" },
          { id: "2412", number: "2412", name: "ม.3/12", type: "classroom" }
        ]
      },
      {
        floor: 5,
        label: "ชั้น 5",
        rooms: [
          { id: "251", number: "251", name: "แหล่งการเรียนรู้คณิตศาสตร์", type: "special" },
          { id: "b2f5r2", name: "ห้องสมุดคณิตศาสตร์", type: "library" },
          { id: "b2f5r3", name: "ห้องคลินิกคณิตศาสตร์", type: "special" },
          { id: "252", number: "252", name: "ม.3/13", type: "classroom" },
          { id: "253", number: "253", name: "ม.3/14", type: "classroom" },
          { id: "254", number: "254", name: "ม.3/15", type: "classroom" },
          { id: "255", number: "255", name: "ม.3/16", type: "classroom" },
          { id: "256", number: "256", name: "ม.4/3", type: "classroom" },
          { id: "257", number: "257", name: "ม.4/4", type: "classroom" },
          { id: "258", number: "258", name: "ม.4/5", type: "classroom" },
          { id: "259", number: "259", name: "ม.4/6", type: "classroom" },
          { id: "2510", number: "2510", name: "ม.4/7", type: "classroom" },
          { id: "2511", number: "2511", name: "ม.4/8", type: "classroom" },
          { id: "2512", number: "2512", name: "ม.4/9", type: "classroom" }
        ]
      }
    ]
  },
  {
    id: "b3",
    name: "อาคาร 3",
    nameEn: "Building 3",
    color: "#a1ff25",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "b3f1r1", name: "ห้องโสตทัศนศึกษา", type: "special" },
          { id: "b3f1r2", name: "ห้องสมุดเฉลิมพระเกียรติ", type: "library" },
          { id: "318", number: "318", name: "ห้องแนะแนว", type: "special" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "321", number: "321", name: "ห้องดนตรีไทย", type: "art" },
          { id: "322", number: "322", name: "", type: "classroom" },
          { id: "323", number: "323", name: "", type: "classroom" },
          { id: "324", number: "324", name: "", type: "classroom" },
          { id: "325", number: "325", name: "", type: "classroom" },
          { id: "326", number: "326", name: "", type: "classroom" },
          { id: "327", number: "327", name: "", type: "classroom" },
          { id: "328", number: "328", name: "ห้องศิลปะ", type: "art" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 3",
        rooms: [
          { id: "331", number: "331", name: "ห้องดนตรีสากล", type: "art" },
          { id: "332", number: "332", name: "", type: "classroom" },
          { id: "333", number: "333", name: "", type: "classroom" },
          { id: "334", number: "334", name: "", type: "classroom" },
          { id: "335", number: "335", name: "", type: "classroom" },
          { id: "336", number: "336", name: "", type: "classroom" },
          { id: "337", number: "337", name: "ห้องนาฏศิลป์", type: "art" },
          { id: "338", number: "338", name: "ห้องนาฏศิลป์", type: "art" }
        ]
      }
    ]
  },
  {
    id: "b4",
    name: "อาคาร 4 (MEP)",
    nameEn: "Building 4 (MEP)",
    color: "#ff7a9b",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "b4f1r1", name: "โรงอาหารเก่า", type: "canteen" },
          { id: "b4f1r2", name: "สหกรณ์", type: "other" },
          { id: "b4f1r3", name: "ร้านขายน้ำดื่ม", type: "other" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "421", number: "421", name: "MEP Resource Center", type: "special" },
          { id: "422", number: "422", name: "Grade 9", type: "classroom" },
          { id: "423", number: "423", name: "Grade 9", type: "classroom" },
          { id: "b4f2r4", name: "Grade 10 Mini English Program", type: "classroom" },
          { id: "b4f2r5", name: "Grade 11 Mini English Program", type: "classroom" },
          { id: "b4f2r6", name: "Grade 12 Mini English Program", type: "classroom" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 3",
        rooms: [
          { id: "431", number: "431", name: "MEP Teachers Room", type: "teacher" },
          { id: "432", number: "432", name: "Grade 7", type: "classroom" },
          { id: "433", number: "433", name: "Grade 7", type: "classroom" },
          { id: "434", number: "434", name: "Grade 8", type: "classroom" },
          { id: "435", number: "435", name: "Grade 8", type: "classroom" },
          { id: "436", number: "436", name: "MEP Computer Room", type: "computer" }
        ]
      }
    ]
  },
  {
    id: "b6",
    name: "อาคาร 6",
    nameEn: "Building 6",
    color: "#e65400",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "b6f1r1", name: "แปลงเกษตร", type: "other" },
          { id: "611", number: "611", name: "ห้องงานช่าง (ทำงานฝีมือ)", type: "workshop" },
          { id: "b6f1r3", name: "สำนักงานหมวดอุตสาหกรรม / ศูนย์วิทยุสื่อสาร", type: "office" },
          { id: "612", number: "612", name: "ห้องเกษตร", type: "workshop" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "621", number: "621", name: "ห้องคหกรรม 1", type: "workshop" },
          { id: "622", number: "622", name: "", type: "classroom" }
        ]
      }
    ]
  },
  {
    id: "bmulti",
    name: "อาคารอเนกประสงค์",
    nameEn: "Multi-Purpose Building",
    color: "#8bfff2",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1",
        rooms: [
          { id: "bm1f1r1", name: "ศูนย์อาหารช่อประดู่", type: "canteen" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "it1", name: "IT 1 ห้องคอม", type: "computer" },
          { id: "it2", name: "IT 2 ห้องคอม", type: "computer" },
          { id: "it3", name: "IT 3 ห้องคอม", type: "computer" },
          { id: "it4", name: "IT 4 ห้องคอม", type: "computer" },
          { id: "it5", name: "IT 5 ห้องคอม", type: "computer" },
          { id: "it6", name: "IT 6 ห้องคอม", type: "computer" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 3",
        rooms: [
          { id: "bm1f3r1", name: "ห้องประชุม / จัดกิจกรรม", type: "meeting" }
        ]
      }
    ]
  },
  {
    id: "bpe",
    name: "อาคารพละ / ศูนย์กีฬา",
    nameEn: "Physical Education / Sports Center",
    color: "#0b202e",
    floors: [
      {
        floor: 1,
        label: "ชั้น 1L",
        rooms: [
          { id: "bpe1r1", name: "ห้องน้ำ", type: "toilet" }
        ]
      },
      {
        floor: 2,
        label: "ชั้น 2",
        rooms: [
          { id: "bpe2r1", name: "ห้องน้ำหญิง", type: "toilet" },
          { id: "pe2", name: "PE 2", type: "sport" },
          { id: "pe3", name: "PE 3", type: "sport" },
          { id: "bpe2r4", name: "สนามแบดมินตัน", type: "sport" }
        ]
      },
      {
        floor: 3,
        label: "ชั้น 2L",
        rooms: [
          { id: "pe1", name: "PE 1", type: "sport" },
          { id: "bpe3r2", name: "กิจกรรมพัฒนาผู้เรียน / งานลูกเสือ / ยุวกาชาด / งานศึกษาวิชาทหาร / กิจกรรมชุมนุม", type: "activity" },
          { id: "bpe3r3", name: "ห้องพักครู", type: "teacher" }
        ]
      },
      {
        floor: 4,
        label: "ชั้น 3",
        rooms: [
          { id: "bpe4r1", name: "สนามบาสเกตบอล", type: "sport" }
        ]
      }
    ]
  }
];

// Room type labels and colors
const ROOM_TYPES = {
  classroom:  { label: "ห้องเรียน",        color: "#4caf50", icon: "🏫" },
  office:     { label: "สำนักงาน",         color: "#2196f3", icon: "🏢" },
  science:    { label: "ห้องวิทยาศาสตร์", color: "#9c27b0", icon: "🔬" },
  computer:   { label: "ห้องคอมพิวเตอร์", color: "#ff9800", icon: "💻" },
  library:    { label: "ห้องสมุด",         color: "#795548", icon: "📚" },
  art:        { label: "ห้องศิลปะ/ดนตรี", color: "#e91e63", icon: "🎨" },
  sport:      { label: "กีฬา",             color: "#8bc34a", icon: "⚽" },
  teacher:    { label: "ห้องพักครู",        color: "#607d8b", icon: "👩‍🏫" },
  special:    { label: "ห้องพิเศษ",        color: "#ff5722", icon: "⭐" },
  medical:    { label: "ห้องพยาบาล",       color: "#f44336", icon: "🏥" },
  canteen:    { label: "โรงอาหาร",         color: "#ff9800", icon: "🍽️" },
  workshop:   { label: "ห้องปฏิบัติการ",  color: "#795548", icon: "🔧" },
  meeting:    { label: "ห้องประชุม",       color: "#3f51b5", icon: "📋" },
  activity:   { label: "ห้องกิจกรรม",      color: "#009688", icon: "🎭" },
  toilet:     { label: "ห้องน้ำ",          color: "#90a4ae", icon: "🚻" },
  other:      { label: "อื่นๆ",            color: "#9e9e9e", icon: "📌" }
};

if (typeof module !== "undefined") module.exports = { BUILDINGS, ROOM_TYPES };
