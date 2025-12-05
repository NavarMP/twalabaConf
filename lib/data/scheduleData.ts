export type ScheduleEvent = {
    time: string;
    title: { en: string; ml: string };
    subtitle?: { en: string; ml: string };
    type: 'ceremony' | 'session' | 'special';
    details?: {
        label: { en: string; ml: string };
        content: { en: string; ml: string };
    }[];
    list?: {
        title?: { en: string; ml: string };
        items: { en: string; ml: string }[];
    }[];
};

export type DaySchedule = {
    date: { en: string; ml: string };
    events: ScheduleEvent[];
};

export const scheduleData: DaySchedule[] = [
    {
        date: { en: "December 05, Friday", ml: "ഡിസംബർ 05, വെള്ളി" },
        events: [
            {
                time: "3.00 PM",
                title: { en: "Registration", ml: "രജിസ്ട്രേഷൻ" },
                type: "ceremony"
            },
            {
                time: "4.00 PM",
                title: { en: "Flag Hoisting", ml: "പതാക ഉയർത്തൽ" },
                type: "ceremony",
                details: [
                    {
                        label: { en: "Flag Hoisting", ml: "പതാക ഉയർത്തൽ" },
                        content: { en: "Shaikhuna Kottamala Moideen Kutty Musliyar", ml: "ശൈഖുനാ കോട്ടുമല മൊയ്‌തീൻ കുട്ടി മുസ്ലിയാർ" }
                    }
                ]
            },
            {
                time: "4.15 PM",
                title: { en: "Inauguration", ml: "ഉദ്ഘാടനം" },
                type: "ceremony",
                details: [
                    { label: { en: "Prayer", ml: "പ്രാർത്ഥന" }, content: { en: "Sayyid Niyas Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് നിയാസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" } },
                    { label: { en: "Welcome", ml: "സ്വാഗതം" }, content: { en: "Abdul Sathar Darimi", ml: "അബ്ദുൽ സത്താർ ദാരിമി" } },
                    { label: { en: "President", ml: "അധ്യക്ഷൻ" }, content: { en: "Shajahan Rahmani Kambalakkad", ml: "ഷാജഹാൻ റഹ്മാനി കമ്പളക്കാട്" } },
                    { label: { en: "Inauguration", ml: "ഉദ്ഘാടനം" }, content: { en: "Shaikh Abdul Hameed Hazrath", ml: "ശൈഖ് അബ്ദുൽ ഹമീദ് ഹസ്രത്ത്" } },
                    { label: { en: "Blessing Speech", ml: "അനുഗ്രഹ പ്രഭാഷണം" }, content: { en: "Sayyid Hameed Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" } },
                    { label: { en: "Keynote Address", ml: "മുഖ്യപ്രഭാഷണം" }, content: { en: "Shaikhuna Olavanna Aboobacker Darimi", ml: "ശൈഖുനാ ഒളവണ്ണ അബൂബക്കർ ദാരിമി" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Shukkoor Vettathur", ml: "ശുക്കൂർ വെട്ടത്തൂർ" } }
                ],
                list: [
                    {
                        title: { en: "Presidium", ml: "പ്രസീഡിയം" },
                        items: [
                            { en: "Sayyid Haris Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് ഹാരിസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" },
                            { en: "Sayyid Fainas Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് ഫൈനാസലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" },
                            { en: "O.M. Zainul Abid Thangal Melattur", ml: "ഒ.എം. സൈനുൽ ആബിദ് തങ്ങൾ മേലാറ്റൂർ" },
                            { en: "Sayyid Kunhi Seethi Koya Thangal", ml: "സയ്യിദ് കുഞ്ഞി സീതിക്കോയ തങ്ങൾ" },
                            { en: "K. Moin Kutty Master", ml: "കെ. മോയിൻ കുട്ടി മാസ്റ്റർ" },
                            { en: "Rasheed Faizy Vellaikode", ml: "റഷീദ് ഫൈസി വെള്ളായിക്കോട്" },
                            { en: "Farooq Faizy Manimooli", ml: "ഫാറൂഖ് ഫൈസി മണിമൂളി" },
                            { en: "Musthafa Hudawi Akkode", ml: "മുസ്തഫ ഹുദവി ആക്കോട്" },
                            { en: "Yunus Faizy Vettupara", ml: "യൂനുസ് ഫൈസി വെട്ടുപാറ" },
                            { en: "Muhsin Master Vellila", ml: "മുഹ്സിൻ മാസ്റ്റർ വെള്ളില" },
                            { en: "Alavi Haji Pallimukku", ml: "അലവി ഹാജി പള്ളിമുക്ക്" },
                            { en: "Jabbar Haji Cheriyaparambu", ml: "ജബ്ബാർ ഹാജി ചെറിയപറമ്പ്" }
                        ]
                    }
                ]
            },
            {
                time: "7.00 - 9.00 PM",
                title: { en: "SESSION 01", ml: "SESSION 01" },
                subtitle: { en: "Muthallimiyam Tradition", ml: "മുതഅല്ലിമീയം ട്രഡീഷൻ" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Musthafa Marayamangalam", ml: "മുസ്തഫ മാരായമംഗലം" } },
                    { label: { en: "Moderator", ml: "മോഡറേറ്റർ" }, content: { en: "Swadiq Faizy Tanur", ml: "സ്വാദിഖ് ഫൈസി താനൂർ" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Anas Puthantheruvu", ml: "അനസ് പുത്തൻതെരുവ്" } }
                ],
                list: [
                    {
                        title: { en: "Topics", ml: "വിഷയങ്ങൾ" },
                        items: [
                            { en: "Samastha's Century; Model of Activism - Mujthaba Faizy Anakkara", ml: "സമസ്തയുടെ നൂറ്റാണ്ട്; ആക്ടിവിസത്തിന്റെ മാതൃക - മുജ്തബ ഫൈസി ആനക്കര" },
                            { en: "Independent India: Usthads in Nation Building - Basith Hudawi Chembra", ml: "സ്വതന്ത്ര ഇന്ത്യ: രാഷ്ട്രനിർമ്മിതിയുടെ ഭാഗമായ ഉസ്താദുമാർ - ബാസിത് ഹുദവി ചെമ്പ്ര" },
                            { en: "Thadrees: Hands of Synthesis - Suhail Haithami Pallikkara", ml: "തദ്‌രീസ്: സമന്വയത്തിന്റെ കൈക്രിയകൾ - സുഹൈൽ ഹൈതമി പള്ളിക്കര" }
                        ]
                    }
                ]
            },
            {
                time: "9.30 - 10.30 PM",
                title: { en: "SESSION 02", ml: "SESSION 02" },
                subtitle: { en: "Rasooliyam Folklore", ml: "റസൂലിയം ഫോക്ലോർ" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Ali Adham Lakshadweep", ml: "അലി അദ്ഹം ലക്ഷദ്വീപ്" } },
                    { label: { en: "Leadership", ml: "നേതൃത്വം" }, content: { en: "Mansoor Puthanathani", ml: "മൻസൂർ പുത്തനത്താണി" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Favas Karuvarakundu", ml: "ഫവാസ് കരുവാരക്കുണ്ട്" } }
                ]
            },
            {
                time: "10.30 PM",
                title: { en: "Alumni Meet", ml: "അലുംനി മീറ്റ്" },
                type: "special"
            }
        ]
    },
    {
        date: { en: "December 06, Saturday", ml: "ഡിസംബർ 06, ശനി" },
        events: [
            {
                time: "8.00 - 9.00 AM",
                title: { en: "SESSION 03", ml: "SESSION 03" },
                subtitle: { en: "Start Up", ml: "സ്റ്റാർട്ട് അപ്പ്" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Suhail Alipparambu, Aslam Azhari Poithumkadavu", ml: "സുഹൈൽ ആലിപ്പറമ്പ്, അസ്‌ലം അസ്‌ഹരി പൊയ്ത്‌തുംകടവ്" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Shafi Tharuvana", ml: "ശാഫി തരുവണ" } }
                ]
            },
            {
                time: "9.00 - 11.00 AM",
                title: { en: "SESSION 04", ml: "SESSION 04" },
                subtitle: { en: "Ummatheeyam (Binocular)", ml: "ഉമ്മത്തീയം (ബൈനോക്കുലർ)" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Vahid Nilamuttam", ml: "വാഹിദ് നിലാമുറ്റം" } },
                    { label: { en: "Moderator", ml: "മോഡറേറ്റർ" }, content: { en: "Anwar Muhyudheen Hudawi", ml: "അൻവർ മുഹ്യുദ്ധീൻ ഹുദവി" } },
                    { label: { en: "Inauguration", ml: "ഉദ്ഘാടനം" }, content: { en: "Sayyid Hameed Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് ഹമീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Shamsan Vazhakkad", ml: "ശംസാൻ വാഴക്കാട്" } }
                ],
                list: [
                    {
                        title: { en: "Topics", ml: "വിഷയങ്ങൾ" },
                        items: [
                            { en: "Costume and Symbol: Kerala Muslim Experience - Shafeeq Rahmani Vazhippara", ml: "വേഷവും ചിഹ്നവും: കേരളത്തിന്റെ മുസ്ലിമാനുഭവം - ഷഫീഖ് റഹ്മാനി വഴിപ്പാറ" },
                            { en: "News Making; Cry of Justice - A. Sajeevan", ml: "വാർത്താ നിർമ്മാണം; നീതിയുടെ നിലവിളി - എ.സജീവൻ" },
                            { en: "Islamophobia; Sowers and Reapers - Sathar Panthallur", ml: "ഇസ്ലാമോഫോബിയ; വിതക്കുന്നവരും കൊയ്യുന്നവരും - സത്താർ പന്തല്ലൂർ" },
                            { en: "Digital Muthallim: Society's View - U.M Mukhtar", ml: "ഡിജിറ്റൽ മുതഅല്ലിം: സമൂഹം കാണുന്നത് - യു.എം മുഖ്‌താർ" }
                        ]
                    }
                ]
            },
            {
                time: "11.00 AM - 12.00 PM",
                title: { en: "SESSION 05", ml: "SESSION 05" },
                subtitle: { en: "Ideology, Organization", ml: "ആദർശം, സംഘാടനം" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Sayyid Rushaid Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് റുശൈദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" } },
                    { label: { en: "Presidium", ml: "പ്രസീഡിയം" }, content: { en: "Abdul Wahab Haithami, Basheer As'adi", ml: "അബ്ദുൽ വഹാബ് ഹൈതമി, ബഷീർ അസ്അദി" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Swalih Thrissur", ml: "സ്വാലിഹ് തൃശ്ശൂർ" } }
                ]
            },
            {
                time: "1.30 - 3.30 PM",
                title: { en: "SESSION 06", ml: "SESSION 06" },
                subtitle: { en: "Vijnaneeyam - Science", ml: "വിജ്ഞാനീയം - സയൻസ്" },
                type: "session",
                details: [
                    { label: { en: "Introduction", ml: "ആമുഖം" }, content: { en: "Rahmathullah Elamkulam", ml: "റഹ്മത്തുള്ള ഏലംകുളം" } },
                    { label: { en: "Moderator", ml: "മോഡറേറ്റർ" }, content: { en: "Shuaibul Haithami", ml: "ശുഐബുൽ ഹൈതമി" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Safwan Neelagiri", ml: "സഫ്‌വാൻ നീലഗിരി" } }
                ],
                list: [
                    {
                        title: { en: "Topics", ml: "വിഷയങ്ങൾ" },
                        items: [
                            { en: "What and How is AI? - Ansar M.P", ml: "എന്താണ്, എങ്ങനെയാണ് AI? - അൻസാർ എം.പി" },
                            { en: "AI: Takleef, Taqleed; Manhajuna - Basheer Faizy Aripra", ml: "AI: തക്ലീഫ്, തഖ്ലീദ്; മൻഹജുനാ - ബഷീർ ഫൈസി അരിപ്ര" },
                            { en: "How will 2050 be? 'Ma Yakoonu?' Imagination - Dr. Munavvar Hanih", ml: "2050 എങ്ങനെയാവും, 'മാ യകൂനു? വിഭാവന - ഡോ.മുനവ്വർ ഹാനിഹ്" }
                        ]
                    }
                ]
            },
            {
                time: "3.30 PM",
                title: { en: "Closing Ceremony", ml: "സമാപനം" },
                type: "ceremony",
                details: [
                    { label: { en: "Prayer", ml: "പ്രാർത്ഥന" }, content: { en: "Sayyid Sabiq Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് സാബിഖലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" } },
                    { label: { en: "Welcome", ml: "സ്വാഗതം" }, content: { en: "Anas Olavara", ml: "അനസ് ഒളവറ" } },
                    { label: { en: "President", ml: "അധ്യക്ഷൻ" }, content: { en: "O.P. Ashraf Kuttikkadavu", ml: "ഒ.പി. അഷ്റഫ് കുറ്റിക്കടവ്" } },
                    { label: { en: "Inauguration", ml: "ഉദ്ഘാടനം" }, content: { en: "Sayyid Muhammad Jifri Muthukkoya Thangal", ml: "സയ്യിദ് മുഹമ്മദ് ജിഫ്രി മുത്തുക്കോയ തങ്ങൾ" } },
                    { label: { en: "Blessing Speech", ml: "അനുഗ്രഹ പ്രഭാഷണം" }, content: { en: "Shaikhuna M.T Abdullah Musliyar", ml: "ശൈഖുനാ എം.ടി അബ്ദുള്ള മുസ്‌ലിയാർ" } },
                    { label: { en: "Keynote Address", ml: "മുഖ്യപ്രഭാഷണം" }, content: { en: "Musthafa Ashrafi Kakuppadi", ml: "മുസ്തഫ അഷ്റഫി കക്കുപ്പടി" } },
                    { label: { en: "Vote of Thanks", ml: "നന്ദി" }, content: { en: "Shibili Ponmundam", ml: "ശിബിലി പൊൻമുണ്ടം" } }
                ],
                list: [
                    {
                        title: { en: "Presidium", ml: "പ്രസീഡിയം" },
                        items: [
                            { en: "Sayyid Fakhruddin Thangal Kannanthali", ml: "സയ്യിദ് ഫഖ്റുദ്ധീൻ തങ്ങൾ കണ്ണന്തളി" },
                            { en: "Sayyid Shuaib Thangal UAE", ml: "സയ്യിദ് ശുഐബ് തങ്ങൾ യു.എ.ഇ" },
                            { en: "Sayyid Abdu Rasheed Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് അബ്ദു റഷീദലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" },
                            { en: "Sayyid Mubashir Thangal Jamalullaili", ml: "സയ്യിദ് മുബശ്ശിർ തങ്ങൾ ജമലുല്ലൈലി" },
                            { en: "Sayyid Hashir Ali Shihab Thangal Panakkad", ml: "സയ്യിദ് ഹാശിറലി ശിഹാബ് തങ്ങൾ പാണക്കാട്" },
                            { en: "Ayoob Master Muttil", ml: "അയ്യൂബ് മാസ്റ്റർ മുട്ടിൽ" },
                            { en: "Basheer As'adi Nambram", ml: "ബഷീർ അസ്അദി നമ്പ്രം" },
                            { en: "M.P Kadungallur", ml: "എം.പി കടുങ്ങല്ലൂർ" },
                            { en: "Mammu Darimi", ml: "മമ്മു ദാരിമി" },
                            { en: "Umar Darsi", ml: "ഉമർ ദർസി" },
                            { en: "Valiyuddin Faizy Vazhakkad", ml: "വലിയുദ്ധീൻ ഫൈസി വാഴക്കാട്" },
                            { en: "Musthafa Hudawi Akkode", ml: "മുസ്തഫ ഹുദവി ആക്കോട്" },
                            { en: "Saleem Yamani Kanjiram", ml: "സലീം യമാനി കാഞ്ഞിരം" },
                            { en: "Alavi Haji Pallimukku", ml: "അലവി ഹാജി പള്ളിമുക്ക്" }
                        ]
                    }
                ]
            }
        ]
    }
];
