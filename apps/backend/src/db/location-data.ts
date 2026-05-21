export interface County {
  id: number;
  code: string;
  name: string;
  slug: string;
}

export interface Constituency {
  id: number;
  countyId: number;
  code: string;
  name: string;
  slug: string;
}

export interface Ward {
  id: number;
  constituencyId: number;
  code: string;
  name: string;
  slug: string;
}

export const countiesData: County[] = [
  { id: 1, code: "001", name: "Mombasa", slug: "mombasa" },
  { id: 2, code: "002", name: "Kwale", slug: "kwale" },
  { id: 3, code: "003", name: "Kilifi", slug: "kilifi" },
  { id: 4, code: "004", name: "Tana River", slug: "tana-river" },
  { id: 5, code: "005", name: "Lamu", slug: "lamu" },
  { id: 6, code: "006", name: "Taita Taveta", slug: "taita-taveta" },
  { id: 7, code: "007", name: "Garissa", slug: "garissa" },
  { id: 8, code: "008", name: "Wajir", slug: "wajir" },
  { id: 9, code: "009", name: "Mandera", slug: "mandera" },
  { id: 10, code: "010", name: "Marsabit", slug: "marsabit" },
  { id: 11, code: "011", name: "Isiolo", slug: "isiolo" },
  { id: 12, code: "012", name: "Meru", slug: "meru" },
  { id: 13, code: "013", name: "Tharaka-Nithi", slug: "tharaka-nithi" },
  { id: 14, code: "014", name: "Embu", slug: "embu" },
  { id: 15, code: "015", name: "Kitui", slug: "kitui" },
  { id: 16, code: "016", name: "Machakos", slug: "machakos" },
  { id: 17, code: "017", name: "Makueni", slug: "makueni" },
  { id: 18, code: "018", name: "Nyandarua", slug: "nyandarua" },
  { id: 19, code: "019", name: "Nyeri", slug: "nyeri" },
  { id: 20, code: "020", name: "Kirinyaga", slug: "kirinyaga" },
  { id: 21, code: "021", name: "Murang'a", slug: "muranga" },
  { id: 22, code: "022", name: "Kiambu", slug: "kiambu" },
  { id: 23, code: "023", name: "Turkana", slug: "turkana" },
  { id: 24, code: "024", name: "West Pokot", slug: "west-pokot" },
  { id: 25, code: "025", name: "Samburu", slug: "samburu" },
  { id: 26, code: "026", name: "Trans Nzoia", slug: "trans-nzoia" },
  { id: 27, code: "027", name: "Uasin Gishu", slug: "uasin-gishu" },
  { id: 28, code: "028", name: "Elgeyo Marakwet", slug: "elgeyo-marakwet" },
  { id: 29, code: "029", name: "Nandi", slug: "nandi" },
  { id: 30, code: "030", name: "Baringo", slug: "baringo" },
  { id: 31, code: "031", name: "Laikipia", slug: "laikipia" },
  { id: 32, code: "032", name: "Nakuru", slug: "nakuru" },
  { id: 33, code: "033", name: "Narok", slug: "narok" },
  { id: 34, code: "034", name: "Kajiado", slug: "kajiado" },
  { id: 35, code: "035", name: "Kericho", slug: "kericho" },
  { id: 36, code: "036", name: "Bomet", slug: "bomet" },
  { id: 37, code: "037", name: "Kakamega", slug: "kakamega" },
  { id: 38, code: "038", name: "Vihiga", slug: "vihiga" },
  { id: 39, code: "039", name: "Bungoma", slug: "bungoma" },
  { id: 40, code: "040", name: "Busia", slug: "busia" },
  { id: 41, code: "041", name: "Siaya", slug: "siaya" },
  { id: 42, code: "042", name: "Kisumu", slug: "kisumu" },
  { id: 43, code: "043", name: "Homa Bay", slug: "homa-bay" },
  { id: 44, code: "044", name: "Migori", slug: "migori" },
  { id: 45, code: "045", name: "Kisii", slug: "kisii" },
  { id: 46, code: "046", name: "Nyamira", slug: "nyamira" },
  { id: 47, code: "047", name: "Nairobi City", slug: "nairobi-city" },
];

export const constituenciesData: Constituency[] = [
  // Mombasa (County 1)
  { id: 1, countyId: 1, code: "00101", name: "Changamwe", slug: "changamwe" },
  { id: 2, countyId: 1, code: "00102", name: "Jomvu", slug: "jomvu" },
  { id: 3, countyId: 1, code: "00103", name: "Kisauni", slug: "kisauni" },
  { id: 4, countyId: 1, code: "00104", name: "Nyali", slug: "nyali" },
  { id: 5, countyId: 1, code: "00105", name: "Likoni", slug: "likoni" },
  { id: 6, countyId: 1, code: "00106", name: "Mvita", slug: "mvita" },

  // Kwale (County 2)
  { id: 7, countyId: 2, code: "00201", name: "Msambweni", slug: "msambweni" },
  { id: 8, countyId: 2, code: "00202", name: "Lunga Lunga", slug: "lunga-lunga" },

  // Kilifi (County 3)
  { id: 9, countyId: 3, code: "00301", name: "Kilifi North", slug: "kilifi-north" },
  { id: 10, countyId: 3, code: "00302", name: "Kilifi South", slug: "kilifi-south" },

  // Meru (County 12) - Fully Detailed
  { id: 11, countyId: 12, code: "01201", name: "Igembe South", slug: "igembe-south" },
  { id: 12, countyId: 12, code: "01202", name: "Igembe Central", slug: "igembe-central" },
  { id: 13, countyId: 12, code: "01203", name: "Igembe North", slug: "igembe-north" },
  { id: 14, countyId: 12, code: "01204", name: "Tigania West", slug: "tigania-west" },
  { id: 15, countyId: 12, code: "01205", name: "Tigania East", slug: "tigania-east" },
  { id: 16, countyId: 12, code: "01206", name: "North Imenti", slug: "north-menti" },
  { id: 17, countyId: 12, code: "01207", name: "Buuri", slug: "buuri" },
  { id: 18, countyId: 12, code: "01208", name: "Central Imenti", slug: "central-imenti" },
  { id: 19, countyId: 12, code: "01209", name: "South Imenti", slug: "south-imenti" },

  // Machakos (County 16)
  { id: 20, countyId: 16, code: "01601", name: "Masinga", slug: "masinga" },
  { id: 21, countyId: 16, code: "01602", name: "Yatta", slug: "yatta" },

  // Kiambu (County 22)
  { id: 22, countyId: 22, code: "02201", name: "Thika Town", slug: "thika-town" },
  { id: 23, countyId: 22, code: "02202", name: "Ruiru", slug: "ruiru" },

  // Nakuru (County 32)
  { id: 24, countyId: 32, code: "03201", name: "Nakuru Town East", slug: "nakuru-town-east" },
  { id: 25, countyId: 32, code: "03202", name: "Nakuru Town West", slug: "nakuru-town-west" },

  // Kakamega (County 37)
  { id: 26, countyId: 37, code: "03701", name: "Lurambi", slug: "lurambi" },
  { id: 27, countyId: 37, code: "03702", name: "Shinyalu", slug: "shinyalu" },

  // Kisumu (County 42)
  { id: 28, countyId: 42, code: "04201", name: "Kisumu Central", slug: "kisumu-central" },
  { id: 29, countyId: 42, code: "04202", name: "Kisumu East", slug: "kisumu-east" },

  // Nairobi City (County 47)
  { id: 30, countyId: 47, code: "04701", name: "Westlands", slug: "westlands" },
  { id: 31, countyId: 47, code: "04702", name: "Dagoretti North", slug: "dagoretti-north" },
  { id: 32, countyId: 47, code: "04703", name: "Dagoretti South", slug: "dagoretti-south" },
  { id: 33, countyId: 47, code: "04704", name: "Lang'ata", slug: "langata" },
  { id: 34, countyId: 47, code: "04705", name: "Kibra", slug: "kibra" },
  { id: 35, countyId: 47, code: "04706", name: "Roysambu", slug: "roysambu" },
  { id: 36, countyId: 47, code: "04707", name: "Kasarani", slug: "kasarani" },
  { id: 37, countyId: 47, code: "04708", name: "Ruaraka", slug: "ruaraka" },
  { id: 38, countyId: 47, code: "04709", name: "Embakasi South", slug: "embakasi-south" },
  { id: 39, countyId: 47, code: "04710", name: "Embakasi North", slug: "embakasi-north" },
  { id: 40, countyId: 47, code: "04711", name: "Embakasi Central", slug: "embakasi-central" },
  { id: 41, countyId: 47, code: "04712", name: "Embakasi East", slug: "embakasi-east" },
  { id: 42, countyId: 47, code: "04713", name: "Embakasi West", slug: "embakasi-west" },
  { id: 43, countyId: 47, code: "04714", name: "Makadara", slug: "makadara" },
  { id: 44, countyId: 47, code: "04715", name: "Kamukunji", slug: "kamukunji" },
  { id: 45, countyId: 47, code: "04716", name: "Starehe", slug: "starehe" },
  { id: 46, countyId: 47, code: "04717", name: "Mathare", slug: "mathare" },
  
  // Adding one constituency for each remaining county to ensure "main constituencies" requirement
  { id: 47, countyId: 4, code: "00401", name: "Garsen", slug: "garsen" },
  { id: 48, countyId: 5, code: "00501", name: "Lamu East", slug: "lamu-east" },
  { id: 49, countyId: 6, code: "00601", name: "Taveta", slug: "taveta" },
  { id: 50, countyId: 7, code: "00701", name: "Garissa Township", slug: "garissa-township" },
  { id: 51, countyId: 8, code: "00801", name: "Wajir North", slug: "wajir-north" },
  { id: 52, countyId: 9, code: "00901", name: "Mandera West", slug: "mandera-west" },
  { id: 53, countyId: 10, code: "01001", name: "Moyale", slug: "moyale" },
  { id: 54, countyId: 11, code: "01101", name: "Isiolo North", slug: "isiolo-north" },
  { id: 55, countyId: 13, code: "01301", name: "Maara", slug: "maara" },
  { id: 56, countyId: 14, code: "01401", name: "Manyatta", slug: "manyatta" },
  { id: 57, countyId: 15, code: "01501", name: "Mwingi North", slug: "mwingi-north" },
  { id: 58, countyId: 17, code: "01701", name: "Mbooni", slug: "mbooni" },
  { id: 59, countyId: 18, code: "01801", name: "Kinangop", slug: "kinangop" },
  { id: 60, countyId: 19, code: "01901", name: "Tetu", slug: "tetu" },
  { id: 61, countyId: 20, code: "02001", name: "Mwea", slug: "mwea" },
  { id: 62, countyId: 21, code: "02101", name: "Kangema", slug: "kangema" },
  { id: 63, countyId: 23, code: "02301", name: "Turkana North", slug: "turkana-north" },
  { id: 64, countyId: 24, code: "02401", name: "Kapenguria", slug: "kapenguria" },
  { id: 65, countyId: 25, code: "02501", name: "Samburu West", slug: "samburu-west" },
  { id: 66, countyId: 26, code: "02601", name: "Kwanza", slug: "kwanza" },
  { id: 67, countyId: 27, code: "02701", name: "Soy", slug: "soy" },
  { id: 68, countyId: 28, code: "02801", name: "Marakwet East", slug: "marakwet-east" },
  { id: 69, countyId: 29, code: "02901", name: "Tinderet", slug: "tinderet" },
  { id: 70, countyId: 30, code: "03001", name: "Baringo North", slug: "baringo-north" },
  { id: 71, countyId: 31, code: "03101", name: "Laikipia West", slug: "laikipia-west" },
  { id: 72, countyId: 33, code: "03301", name: "Narok North", slug: "narok-north" },
  { id: 73, countyId: 34, code: "03401", name: "Kajiado Central", slug: "kajiado-central" },
  { id: 74, countyId: 35, code: "03501", name: "Kipkelion East", slug: "kipkelion-east" },
  { id: 75, countyId: 36, code: "03601", name: "Sotik", slug: "sotik" },
  { id: 76, countyId: 38, code: "03801", name: "Vihiga", slug: "vihiga-constituency" },
  { id: 77, countyId: 39, code: "03901", name: "Kanduyi", slug: "kanduyi" },
  { id: 78, countyId: 40, code: "04001", name: "Teso North", slug: "teso-north" },
  { id: 79, countyId: 41, code: "04101", name: "Ugenya", slug: "ugenya" },
  { id: 80, countyId: 43, code: "04301", name: "Kasipul", slug: "kasipul" },
  { id: 81, countyId: 44, code: "04401", name: "Rongo", slug: "rongo" },
  { id: 82, countyId: 45, code: "04501", name: "Bonchari", slug: "bonchari" },
  { id: 83, countyId: 46, code: "04601", name: "Kitutu Masaba", slug: "kitutu-masaba" },
];

export const wardsData: Ward[] = [
  // Meru - Igembe South (Constituency 11)
  { id: 1, constituencyId: 11, code: "0120101", name: "Maua", slug: "maua" },
  { id: 2, constituencyId: 11, code: "0120102", name: "Akachiu", slug: "akachiu" },
  { id: 3, constituencyId: 11, code: "0120103", name: "Kanuni", slug: "kanuni" },
  { id: 4, constituencyId: 11, code: "0120104", name: "Athiru Gaiti", slug: "athiru-gaiti" },
  { id: 5, constituencyId: 11, code: "0120105", name: "Kiegoi/Antubochiu", slug: "kiegoi-antubochiu" },

  // Meru - Igembe Central (Constituency 12)
  { id: 6, constituencyId: 12, code: "0120201", name: "Akirang'ondu", slug: "akirangondu" },
  { id: 7, constituencyId: 12, code: "0120202", name: "Athiru Ruujine", slug: "athiru-ruujine" },
  { id: 8, constituencyId: 12, code: "0120203", name: "Igembe East", slug: "igembe-east" },
  { id: 9, constituencyId: 12, code: "0120204", name: "Njia", slug: "njia" },
  { id: 10, constituencyId: 12, code: "0120205", name: "Kangeta", slug: "kangeta" },

  // Meru - Igembe North (Constituency 13)
  { id: 11, constituencyId: 13, code: "0120301", name: "Amwathi", slug: "amwathi" },
  { id: 12, constituencyId: 13, code: "0120302", name: "Antuambui", slug: "antuambui" },
  { id: 13, constituencyId: 13, code: "0120303", name: "Antubetwe Kiongo", slug: "antubetwe-kiongo" },
  { id: 14, constituencyId: 13, code: "0120304", name: "Naathu", slug: "naathu" },
  { id: 15, constituencyId: 13, code: "0120305", name: "Ntunene", slug: "ntunene" },

  // Meru - Tigania West (Constituency 14)
  { id: 16, constituencyId: 14, code: "0120401", name: "Athwana", slug: "athwana" },
  { id: 17, constituencyId: 14, code: "0120402", name: "Akithii", slug: "akithii" },
  { id: 18, constituencyId: 14, code: "0120403", name: "Kianjai", slug: "kianjai" },
  { id: 19, constituencyId: 14, code: "0120404", name: "Nkomo", slug: "nkomo" },
  { id: 20, constituencyId: 14, code: "0120405", name: "Mbeu", slug: "mbeu" },

  // Meru - Tigania East (Constituency 15)
  { id: 21, constituencyId: 15, code: "0120501", name: "Thangatha", slug: "thangatha" },
  { id: 22, constituencyId: 15, code: "0120502", name: "Mikinduri", slug: "mikinduri" },
  { id: 23, constituencyId: 15, code: "0120503", name: "Kiguchwa", slug: "kiguchwa" },
  { id: 24, constituencyId: 15, code: "0120504", name: "Karama", slug: "karama" },
  { id: 25, constituencyId: 15, code: "0120505", name: "Muthara", slug: "muthara" },

  // Meru - North Imenti (Constituency 16)
  { id: 26, constituencyId: 16, code: "0120601", name: "Municipality", slug: "municipality" },
  { id: 27, constituencyId: 16, code: "0120602", name: "Ntima East", slug: "ntima-east" },
  { id: 28, constituencyId: 16, code: "0120603", name: "Ntima West", slug: "ntima-west" },
  { id: 29, constituencyId: 16, code: "0120604", name: "Nyaki East", slug: "nyaki-east" },
  { id: 30, constituencyId: 16, code: "0120605", name: "Nyaki West", slug: "nyaki-west" },

  // Meru - Buuri (Constituency 17)
  { id: 31, constituencyId: 17, code: "0120701", name: "Timau", slug: "timau" },
  { id: 32, constituencyId: 17, code: "0120702", name: "Kisima", slug: "kisima" },
  { id: 33, constituencyId: 17, code: "0120703", name: "Kiirua/Naari", slug: "kiirua-naari" },
  { id: 34, constituencyId: 17, code: "0120704", name: "Ruiri/Rwarera", slug: "ruiri-rwarera" },

  // Meru - Central Imenti (Constituency 18)
  { id: 35, constituencyId: 18, code: "0120801", name: "Mwanganthia", slug: "mwanganthia" },
  { id: 36, constituencyId: 18, code: "0120802", name: "Abothuguchi Central", slug: "abothuguchi-central" },
  { id: 37, constituencyId: 18, code: "0120803", name: "Abothuguchi West", slug: "abothuguchi-west" },
  { id: 38, constituencyId: 18, code: "0120804", name: "Kiagu", slug: "kiagu" },
  { id: 39, constituencyId: 18, code: "0120805", name: "Kibirichia", slug: "kibirichia" },

  // Meru - South Imenti (Constituency 19)
  { id: 40, constituencyId: 19, code: "0120901", name: "Mitunguu", slug: "mitunguu" },
  { id: 41, constituencyId: 19, code: "0120902", name: "Igoji East", slug: "igoji-east" },
  { id: 42, constituencyId: 19, code: "0120903", name: "Igoji West", slug: "igoji-west" },
  { id: 43, constituencyId: 19, code: "0120904", name: "Abogeta East", slug: "abogeta-east" },
  { id: 44, constituencyId: 19, code: "0120905", name: "Abogeta West", slug: "abogeta-west" },
  { id: 45, constituencyId: 19, code: "0120906", name: "Nkuene", slug: "nkuene" },

  // Nairobi - Westlands (Constituency 30)
  { id: 46, constituencyId: 30, code: "0470101", name: "Kitisuru", slug: "kitisuru" },
  { id: 47, constituencyId: 30, code: "0470102", name: "Parklands/Highridge", slug: "parklands-highridge" },
  { id: 48, constituencyId: 30, code: "0470103", name: "Karura", slug: "karura" },
  { id: 49, constituencyId: 30, code: "0470104", name: "Kangemi", slug: "kangemi" },
  { id: 50, constituencyId: 30, code: "0470105", name: "Mountain View", slug: "mountain-view" },
  
  // Placeholder wards for other major constituencies to ensure functionality
  { id: 51, constituencyId: 6, code: "0010601", name: "Mji wa Kale/Makadara", slug: "mji-wa-kale-makadara" },
  { id: 52, constituencyId: 34, code: "0470501", name: "Lindi", slug: "lindi" },
  { id: 53, constituencyId: 34, code: "0470502", name: "Makina", slug: "makina" },
];
