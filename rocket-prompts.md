# Rocket Admin: Bosqichma-bosqich promptlar

## Qanday ishlatish

1. Har yangi sessiyani **S0 (Kontekst)** prompti bilan boshlang.
2. Keyin navbatdagi promptni yuboring va **o'sha raqamli shablon rasmini** biriktiring.
3. **"-B"** bilan tugaydigan promptlar backend uchun. Ular UI promptlaridan oldin bajariladi.
4. Bitta prompt tugab, ishlashini tekshirmaguningizcha keyingisiga o'tmang.

**Tavsiya etilgan tartib:**
S1–S6 → Auth (98–107) → Dashboard (01–12, mock data) → E-Commerce → Calendar → Mail → Chat → Tasks → Projects → File Manager → Notes → Contacts → Profile → Timeline → Integratsiya (I1–I5)

---

## S0. Kontekst (har sessiya boshida)

```
Men "Rocket" nomli admin panel loyihasini qilyapman. Stack:
- Monorepo: pnpm + Turborepo (apps/web, apps/api, packages/shared)
- Frontend: Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, TanStack Query,
  TanStack Table, Zustand, React Hook Form + Zod, Recharts, Socket.IO client
- Backend: NestJS, Mongoose (MongoDB), Passport JWT (httpOnly cookie, access+refresh),
  Redis, BullMQ, MinIO/S3, Swagger
- Arxitektura: frontend feature-based (src/features/<feature>/{components,api.ts,hooks.ts}),
  backend modulli (controller → service → repository → schema, dto/)
- API: /api/v1, list javobi { data, meta: { page, limit, total, totalPages } }
- Zod sxemalar va typelar packages/shared ichida, ikkala tomonda ishlatiladi

Qoidalar:
- Biriktirilgan rasmga iloji boricha aniq moslab yasa (spacing, rang, shrift, radius).
- Mavjud umumiy komponentlarni qayta ishlat, yangisini dublikat qilma.
- Faqat shu prompt doirasidagi ishni qil, keyingi bosqichlarga o'tib ketma.
- Oxirida: o'zgargan/yangi fayllar ro'yxati va qanday tekshirish kerakligini yoz.
```

---

# 0-BOSQICH: SETUP

### S1. Monorepo va infratuzilma
```
pnpm + Turborepo monorepo yarat: apps/web (Next.js 15, TS, App Router, src/), apps/api (NestJS),
packages/shared, packages/config (tsconfig, eslint, prettier).
docker-compose.yml: mongo, redis, minio, mailpit. Har app uchun .env.example.
Root scriptlar: dev, build, lint, typecheck. `pnpm dev` ikkala appni birga ishga tushirsin.
```

### S2. Shared paket
```
packages/shared ichida:
- enums: UserRole, ProductStatus, OrderStatus, PaymentType, TaskPriority va boshqalar
- PaginationQuery va PaginatedResponse<T> Zod sxemalari + typelari
- ApiError type
- index.ts orqali export. apps/web va apps/api da import qilish ishlashini tekshir.
```

### S3. NestJS bazasi
```
apps/api da:
- @nestjs/config + Joi bilan env validatsiya
- Mongoose ulanishi, base schema plugin (timestamps, toJSON da _id → id)
- common/: AllExceptionsFilter, ResponseTransformInterceptor, ZodValidationPipe,
  ParseObjectIdPipe, @CurrentUser, @Public, @Roles decoratorlar
- PaginationQueryDto va paginate() helper (page, limit, sort, search)
- Global prefix /api/v1, CORS (credentials: true, WEB_URL), cookie-parser, helmet
- Swagger /api/docs, GET /health endpoint
```

### S4. Next.js bazasi
```
apps/web da:
- Tailwind + shadcn/ui o'rnat. Rasmlardagi dizayndan design tokenlar chiqar:
  primary ko'k (~#3E4DF5), accent to'q sariq (~#F7A35C), success yashil, danger qizil,
  fon och kulrang, kartalar oq, radius ~12px, shrift Poppins (next/font).
- Providers: TanStack Query, Toaster
- lib/api-client.ts: axios, withCredentials, 401 da /auth/refresh qilib so'rovni qaytaruvchi interceptor
- lib/utils.ts: formatCurrency, formatDate, cn
[Rasm: istalgan dashboard rasmi]
```

### S5. Asosiy layout
```
(dashboard) route group uchun layout:
- Sidebar: "Rocket" logo, menyu (Dashboard, E-Commerce ochiladigan submenyu bilan:
  Products/Orders/Customers, Calendar, Mail (badge), Chat, Tasks, Projects, File Manager,
  Notes, Contacts). Aktiv item ajratib ko'rsatiladi.
- Sidebar ikki rejimda: to'liq va faqat ikonkali (icon rail). Holati Zustand'da.
- Header: menu toggle, search, bell ikonka, avatar + ism dropdown (hozircha bo'sh).
- Mobil: sidebar drawer bo'lib ochiladi.
Har menyu itemi uchun bo'sh placeholder sahifa yarat.
[Rasm: 01 va 04]
```

### S6. Umumiy komponentlar
```
components/common ichida:
- Card (title, actions, "..." menyu slot)
- PageHeader (title, o'ng tomonda actions)
- DataTable (TanStack Table: checkbox select, sort, server-side pagination,
  "Showing 1-10 of 100", rows-per-page select)
- StatusBadge (variantlar: success, warning, danger, neutral)
- DateRangePicker ("19 Aug – 25 Aug" ko'rinishida), PeriodSelect ("Last 7 days")
- ExportMenu (Print, Excel, PDF, CSV dropdown)
- SearchInput (debounce), ConfirmDialog, EmptyState, UserAvatar
Har birini /dev/components demo sahifasida ko'rsat.
[Rasm: 13 va 26]
```

---

# AUTHORIZATION (98–107)

### AUTH-B. Auth backend
```
users moduli: schema (email unique, passwordHash, firstName, lastName, avatar, role, jobTitle,
phone, birthday, location, refreshTokenHash, isLocked).
auth moduli: POST /auth/register, /auth/login, /auth/refresh, /auth/logout, GET /auth/me.
argon2 hash, access token 15 min, refresh 7 kun, ikkalasi httpOnly cookie.
JwtAuthGuard global, @Public() bilan ochiladi. RolesGuard. Swagger'da hujjatla.
```

### 98. Login V.1
```
(auth) layout va /login sahifasi. RHF + Zod (shared'dan). Email, password, "Remember me",
"Forgot password?" link, Register link. Muvaffaqiyatda /dashboard ga redirect.
middleware.ts: cookie bo'lmasa (dashboard) route'lardan /login ga yo'naltirsin.
[Rasm: 98]
```

### 99. Login V.2
```
Login V.2 ko'rinishini yasa (rasmga qarab). Logika 98-dagi hook'dan qayta ishlatilsin,
faqat UI boshqa. /login?v=2 orqali ochilsin.
[Rasm: 99]
```

### 100. Register V.1
```
/register sahifasi: ism, familiya, email, parol, parolni tasdiqlash, shartlarga rozilik checkbox.
Muvaffaqiyatda avtomatik login va /dashboard.
[Rasm: 100]
```

### 101. Register V.2
```
Register V.2 UI varianti, /register?v=2. Logika 100 bilan umumiy.
[Rasm: 101]
```

### 102-B. Forgot/Reset backend
```
POST /auth/forgot-password: random token, hash'i DB'da (1 soat TTL), BullMQ orqali email
(nodemailer, dev'da mailpit). Email mavjud bo'lmasa ham bir xil javob qaytar.
POST /auth/reset-password: token tekshiruvi, yangi parol, barcha refresh tokenlarni bekor qil.
```

### 102. Forgot Password V.1
```
/forgot-password sahifasi: email input, yuborilgandan keyin "emailingizni tekshiring" holati.
[Rasm: 102]
```

### 103. Forgot Password V.2
```
Forgot Password V.2 UI varianti, ?v=2.
[Rasm: 103]
```

### 104. Reset Password V.1
```
/reset-password/[token]: yangi parol + tasdiqlash. Muvaffaqiyatda /login ga toast bilan.
Token yaroqsiz bo'lsa xato holati.
[Rasm: 104]
```

### 105. Reset Password V.2
```
Reset Password V.2 UI varianti.
[Rasm: 105]
```

### 106. Lock Screen V.1
```
Backend: POST /auth/lock (user.isLocked=true), POST /auth/unlock (faqat parol).
Frontend: /lock-screen (avatar, ism, parol input). User menyuda "Lock" tugmasi.
isLocked bo'lsa middleware /lock-screen ga yo'naltirsin.
[Rasm: 106]
```

### 107. Lock Screen V.2
```
Lock Screen V.2 UI varianti.
[Rasm: 107]
```

---

# DASHBOARD (01–12)

> Hozircha mock data bilan (features/dashboard/mock.ts). Real ma'lumot I3 promptida ulanadi.

### 01. Dashboard #1
```
features/dashboard/widgets ichida qayta ishlatiladigan widgetlar yasa va /dashboard ga joylashtir:
- StatCard (title, qiymat, % o'zgarish yashil/qizil, rangli ikonka)
- StatisticsBarChart (Income vs Expense, haftalik, tooltip)
- AnalyticsLineChart (2 chiziq, area gradient, tooltip)
- SalesGauge (donut progress, Current/Last week)
- DivergingBarChart (gorizontal, ikki tomonlama)
- LastOrdersTable (mini jadval)
- TransactionsList (avatar, ism, vaqt, summa +/- rangli)
Har widget DateRangePicker yoki "..." menyu bilan. Mock data typed bo'lsin.
[Rasm: 01]
```

### 02. Dashboard #2
```
/dashboard/finance. Yangi widgetlar:
- StatCard'ning sparkline varianti
- BalanceCard (ko'k fon, katta summa, to'lqin grafik, Income/Spending)
- MyCardsWidget (VISA karta vizuali + karta ma'lumotlari ro'yxati, "Add Card", "Pay Debt", "Cancel")
- TransactionsList'ning kategoriya ikonkali varianti (Shopping, Travel, Food...)
StatisticsBarChart qayta ishlatilsin.
[Rasm: 02]
```

### 03. Dashboard #2 [Chat]
```
O'ng tomondan ochiladigan ChatPanel (Sheet): yuqorida kontaktlar avatar qatori, xabarlar
(o'ziniki ko'k, boshqaniki oq), "typing..." indikatori, xabar yozish inputi.
Header'dagi ikonka bilan ochiladi. Hozircha mock, Chat bosqichida real ulanadi.
[Rasm: 03]
```

### 04. Dashboard #3
```
/dashboard/projects. Layout: icon rail sidebar + o'ng tomonda RightPanel
(user kartasi, mini kalendar, RecentActivity).
Widgetlar:
- TaskTile (ikonka, raqam, label: Total/New/In Progress/Done)
- ProjectsGauge (yarim doira, Ongoing/Hold/Done)
- ActiveTasksList (Day/Week/Month tablar, checkbox, rangli chap chiziq)
- PostingTasksHeatmap (kun × soat grid, tooltip)
- RecentActivity (sana bo'yicha guruhlangan, vaqt + avatar + matn)
[Rasm: 04]
```

### 05. Dashboard #3 [Notifications]
```
Header'dagi bell uchun NotificationsDropdown: o'qilmaganlar soni badge, ro'yxat
(ikonka/avatar, matn, vaqt), "Mark all as read", "View all". Mock data. Backend I2 da.
[Rasm: 05]
```

### 06. Dashboard #3 [User Menu]
```
Header'dagi avatar uchun UserMenu dropdown: ism, email, My Profile, Settings, Lock Screen,
Logout. Logout va Lock real endpointlarga ulansin.
[Rasm: 06]
```

### 07. Dashboard #4
```
/dashboard/tasks. Mavjud widgetlardan yig'iladi + yangilari:
- MiniBarStat (kichik bar grafik + raqam)
- ProjectsDonut (ko'p qavatli donut, Ongoing/Hold/Done)
- TotalProjectsProgress (kategoriya + progress bar + raqam)
ActiveTasksList, PostingTasksHeatmap, RightPanel qayta ishlatilsin.
[Rasm: 07]
```

### 08. Dashboard #5
```
/dashboard/social. Layout: chapda ProfileSidebar (avatar, ism, lavozim, Edit profile,
INFO bloki, FAVORITES ro'yxati), yuqorida Settings/Activity/Users tablar.
Widgetlar: 4 ta StatCard (Visitors, Followers, Likes, Comments), VisitsAreaChart
(Min/Avg/Max), FollowersDonut (manba bo'yicha), FollowersGrowthBars, NewFollowersList (Follow tugmasi).
[Rasm: 08]
```

### 09. Dashboard #5 V.2
```
/dashboard/analytics. StatCard x3, stacked StatisticsBarChart, AnalyticsLineChart,
TopSourceCard x4 (Browser, Platform, Country, Search Engine: logo + sessions),
OnlineUsersDonut (Web/iOS/Android %).
[Rasm: 09]
```

### 10. Dashboard #6
```
/dashboard/wallet. Income/Spent vertikal kartalar, BalanceLineChart, TransactionsList,
PaymentsList (kategoriya ikonkali), o'ng panelda CardsCarousel (VISA kartalar, dot pagination)
va ContactsList ("+" va "..." bilan).
[Rasm: 10]
```

### 11. Dashboard #6 [Add Card]
```
AddCardModal: Card Number (mask, brand ikonka), Card Holder, Month, Year, "Add Card".
Zod validatsiya (Luhn). Hozircha mock store'ga qo'shilsin. Fon blur/overlay.
[Rasm: 11]
```

### 12. Dashboard #6 [Add Contact]
```
AddContactModal: avatar upload preview, First/Last name, Email, Phone (davlat kodi select),
Job Title, "Add Contact". Contacts bosqichida shu forma qayta ishlatiladi.
[Rasm: 12]
```

---

# E-COMMERCE (13–36)

### EC-B1. Products backend
```
categories moduli (name, slug, parent) va products moduli:
schema: name, sku, description, category, tags[], images[], price, taxIncludedPrice,
taxRule, unitPrice, stock, status (available/disabled), shipping{weight, width, height, length}.
Endpointlar: GET /products (page, limit, sort, search, status, category, dateFrom, dateTo,
priceMin, priceMax), GET /products/:id, POST, PATCH, DELETE, POST /products/bulk.
GET /products/counts → {all, available, disabled}. Text index. Seed script (100 ta mahsulot).
```

### 13. Products V.1 [List]
```
/ecommerce/products: PageHeader (Export, "+" tugma), All/Available/Disabled tablar (count bilan),
SearchInput, filter ikonka, Actions dropdown, DataTable (Product Name, Product No, Category,
Date, Price, Status badge, "..." menyu), list/grid toggle. Barcha holat URL query'da saqlansin.
[Rasm: 13]
```

### 14. Products – Filter
```
Filter popover: Category select, Status select, Date range, Price range slider, "Save".
Tanlangan filterlar URL'ga yozilib, backend'ga yuborilsin.
[Rasm: 14]
```

### 15. Products V.2 [List]
```
Products list V.2 varianti (rasmdagi farqlarga qarab). DataTable qayta ishlatilsin, faqat
ustunlar/ko'rinish konfiguratsiyasi farq qilsin.
[Rasm: 15]
```

### 16. Products V.1 [Grid]
```
?view=grid: ProductCard (status badge, rasm, nom, sana, kategoriya, narx, select checkbox,
tanlanganda ko'k border). Responsive 4/3/2/1 ustun. Pagination umumiy.
[Rasm: 16]
```

### 17. Products V.2 [Grid]
```
Grid V.2 varianti. ProductCard'ga variant prop qo'sh.
[Rasm: 17]
```

### 18. Search Results
```
SearchInput'ga autocomplete dropdown: yozish bilan mos mahsulotlar ro'yxati (debounce 300ms),
klaviatura bilan navigatsiya, "x" bilan tozalash. Jadval natijalar bilan yangilansin.
[Rasm: 18]
```

### 19. Add Product V.1
```
O'ng tomondan ochiladigan AddProductDrawer: Product Name, Description (Tiptap toolbar bilan),
Category, Tags (chip input), Save/Cancel. POST /products, muvaffaqiyatda ro'yxat invalidate.
[Rasm: 19]
```

### 20. Add Product V.2 [Information]
```
Tabli AddProductModal (Information, Images, Pricing, Inventory, Shipping). Tablar orasida
ma'lumot saqlanadigan bitta RHF forma. Bu promptda faqat Information tabi.
[Rasm: 20]
```

### 21-B. Upload backend
```
files moduli bazasi: POST /uploads (multer, MinIO/S3), rasm turi va hajm validatsiyasi,
{ url, key } qaytarsin. Presigned yoki public URL.
```

### 21. Add Product V.2 [Images]
```
Images tabi: drag & drop upload zona, yuklash progressi, preview grid, o'chirish,
asosiy rasmni tanlash, tartibni o'zgartirish.
[Rasm: 21]
```

### 22. Add Product V.2 [Pricing]
```
Pricing tabi: Tax excluded price, Tax included price (tax rule bo'yicha avto hisob),
Tax rule select ("Create new tax" link), Unit price + Per.
[Rasm: 22]
```

### 23. Add Product V.2 [Inventory]
```
Inventory tabi: SKU, Quantity (stepper). SKU unique tekshiruvi backend'da.
[Rasm: 23]
```

### 24. Add Product V.2 [Shipping]
```
Shipping tabi: weight, o'lchamlar, yetkazish sozlamalari (rasmga qarab). Oxirgi tabda
butun forma POST/PATCH qilinsin. Edit rejimida ham shu modal ochilsin.
[Rasm: 24]
```

### 25. Product Details
```
ProductDetailsModal (intercepting route /ecommerce/products/[id]): rasm galereya + thumbnaillar,
nom, SKU, description, quantity stepper, narx, Add to Cart, sevimli tugma, Specifications jadvali.
To'g'ridan-to'g'ri URL ochilsa alohida sahifa bo'lib ko'rinsin.
[Rasm: 25]
```

### EC-B2. Orders backend
```
orders moduli: orderNo (auto, unique), customer (ref), items[{productId, name, price, qty}]
(snapshot), subtotal, tax, total, paymentType, status (pending/processing/shipped/
refunded/cancelled), history[]. GET /orders (filter, search, pagination), GET /orders/:id,
POST, PATCH /orders/:id/status, GET /orders/counts. Seed (customers seed'dan keyin ham ishlasin).
```

### 26. Orders V.1
```
/ecommerce/orders: All/Pending/Processing/Refunded tablar, Search, Actions, DataTable
(Order No, Customer, Date, Total, Payment, Status badge), Export.
[Rasm: 26]
```

### 27. Orders V.2
```
Orders V.2 varianti (rasmga qarab), DataTable konfiguratsiyasi orqali.
[Rasm: 27]
```

### 28. Order Detail [Order Details]
```
OrderDetailModal: Order Details / Products / Invoice tablar. Bu promptda Order Details tabi:
mijoz, manzil, to'lov, status (o'zgartirish mumkin), history timeline.
[Rasm: 28]
```

### 29. Order Detail [Products]
```
Products tabi: buyurtmadagi mahsulotlar ro'yxati (rasm, nom, narx, miqdor, jami), subtotal/tax/total.
[Rasm: 29]
```

### 30. Order Detail [Invoice]
```
Backend: GET /orders/:id/invoice.pdf (pdfkit yoki puppeteer).
Frontend: Invoice tabi rasmdagidek preview (logo, kompaniya ma'lumoti, jadval, subtotal/tax/total),
Export dropdown: Print, PDF yuklab olish.
[Rasm: 30]
```

### EC-B3. Customers backend
```
customers moduli: firstName, lastName, email (unique), phone, avatar, addresses[] (embed),
paymentMethods[] (faqat brand, last4, expMonth, expYear, to'liq raqam saqlanmaydi),
ordersCount, totalSpent. CRUD + list filter. Seed.
```

### 31. Customers V.1
```
/ecommerce/customers: DataTable (avatar+ism, email, telefon, buyurtmalar soni, jami xarajat,
sana, "..."), search, Export, "+".
[Rasm: 31]
```

### 32. Customers V.2
```
Customers V.2 varianti.
[Rasm: 32]
```

### 33. Add Customer [Profile]
```
AddCustomer stepper modal/sahifa (Profile → Address → Payment → Submission), yuqorida qadam
indikatori. Bitta RHF forma, har qadamda shu qadam maydonlari validatsiya qilinadi.
Bu promptda Profile qadami: avatar, ism, familiya, email, telefon.
[Rasm: 33]
```

### 34. Add Customer [Address]
```
Address qadami: davlat, shahar, ko'cha, zip, bir nechta manzil qo'shish imkoniyati.
[Rasm: 34]
```

### 35. Add Customer [Payment]
```
Payment qadami: karta qo'shish (11-dagi karta formasi qayta ishlatilsin), backend'ga faqat last4/brand.
[Rasm: 35]
```

### 36. Add Customer [Submission]
```
Submission qadami: barcha ma'lumotlar xulosasi, Edit linklar, Submit → POST /customers,
muvaffaqiyat holati.
[Rasm: 36]
```

---

# CALENDAR (37–47)

### CAL-B. Calendar backend
```
calendars (owner, name, color, isVisible, members[]) va events (calendar, title, description,
start, end, allDay, location, attendees[], reminder, color) modullari.
GET /events?from&to&calendarIds=, CRUD. GET/POST/PATCH/DELETE /calendars.
Faqat owner/members ko'ra olsin.
```

### 37. Calendar – Month
```
/calendar: FullCalendar month view, chapda mini kalendar va "My Calendars" ro'yxati
(rangli checkbox bilan ko'rsat/yashir), yuqorida Today, oldingi/keyingi, Month/Week/Day toggle.
Eventlar ko'rinayotgan oraliq bo'yicha backend'dan olinsin.
[Rasm: 37]
```

### 38. Add New Calendar
```
AddCalendarModal: nom, rang tanlash. POST /calendars.
[Rasm: 38]
```

### 39. Options Calendar
```
Kalendar itemi yonidagi "..." menyu: Edit, Change color, Delete (ConfirmDialog).
[Rasm: 39]
```

### 40. More Events
```
Kunda eventlar ko'p bo'lsa "+N more" va popover'da shu kunning barcha eventlari.
[Rasm: 40]
```

### 41. New Event
```
NewEventModal: title, calendar select, sana/vaqt, all day, location, description, attendees.
Kalendarda bo'sh joyni bosganda shu sana bilan ochilsin.
[Rasm: 41]
```

### 42. New Event [Date Picker]
```
NewEvent formadagi sana maydoni uchun rasmdagi custom DatePicker popover.
[Rasm: 42]
```

### 43. New Event [Time Setting]
```
Vaqt tanlash komponenti (rasmdagidek), start < end validatsiyasi.
[Rasm: 43]
```

### 44. Event Preview
```
Eventni bosganda EventPreview popover: title, vaqt, joy, ishtirokchilar, Edit/Delete.
Drag & drop va resize bilan vaqtni o'zgartirish → PATCH (optimistic update).
[Rasm: 44]
```

### 45. Deleting Event
```
Event o'chirish tasdiqlash dialogi va o'chirilgandan keyin "Undo" toast.
[Rasm: 45]
```

### 46. Calendar – Week
```
Week view rasmga moslab stillansin (vaqt ustuni, joriy vaqt chizig'i).
[Rasm: 46]
```

### 47. Calendar – Day
```
Day view rasmga moslab stillansin.
[Rasm: 47]
```

---

# MAIL (48–52)

> Ichki xabar tizimi (foydalanuvchilar orasida). Haqiqiy IMAP/SMTP keyinroq.

### MAIL-B. Mail backend
```
mails (from, to[], cc[], subject, body (html), attachments[], threadId, ownerFolder per user:
inbox/sent/draft/trash/spam, labels[], isRead, isStarred) va mailLabels modullari.
GET /mails?folder&label&search&page, GET /mails/:id (isRead=true), POST /mails (send),
POST /mails/draft, PATCH (star, read, labels, move), DELETE. GET /mails/counts.
```

### 48. Mail – Inbox V.1
```
/mail: chapda Compose tugmasi, folderlar (count bilan), Labels ro'yxati; o'rtada xabarlar
ro'yxati (avatar, jo'natuvchi, mavzu, preview, vaqt, yulduzcha, checkbox, bulk actions);
xabar bosilganda o'qish ko'rinishi.
[Rasm: 48]
```

### 49. Add New Label
```
AddLabelModal: nom, rang. POST /mail-labels.
[Rasm: 49]
```

### 50. Options Label
```
Label yonidagi "..." menyu: Edit, Delete, rang o'zgartirish.
[Rasm: 50]
```

### 51. Mail – Inbox V.2
```
Inbox V.2 varianti: ro'yxat va o'qish paneli yonma-yon (rasmga qarab).
[Rasm: 51]
```

### 52. Compose Mail
```
ComposeMail oynasi: To (user autocomplete, chip), Cc/Bcc, Subject, Tiptap body, attachment
upload, Send, Save draft, yopish. Minimize qilish mumkin bo'lsin.
[Rasm: 52]
```

---

# CHAT (53–57)

### CHAT-B1. Chat REST backend
```
conversations (type private/team, name, avatar, members[], admins[], lastMessage embed) va
messages (conversation, sender, text, attachments[], readBy[]) modullari.
GET /conversations, POST /conversations (private: mavjud bo'lsa o'shani qaytarsin),
GET /conversations/:id/messages (cursor pagination), POST /conversations/:id/members.
```

### CHAT-B2. Chat gateway
```
Socket.IO /chat namespace, handshake'da JWT tekshiruvi (WsJwtGuard, cookie'dan).
Room'lar: user:{id}, conversation:{id}. Eventlar: message:send → saqlab message:new emit,
message:read, typing:start/stop, presence:online/offline.
Frontend: lib/socket.ts (singleton, auto reconnect), useSocketEvent hook.
```

### 53. Chat – Private V.1
```
/chat: chapda suhbatlar ro'yxati (search, avatar, online nuqta, oxirgi xabar, vaqt, unread badge),
o'ngda xabarlar (guruhlangan, sana ajratgich, o'qilganlik belgisi), typing indikator,
input (emoji, attachment, send). Yuqoriga scroll qilganda eski xabarlar yuklansin.
Real-time socket orqali.
[Rasm: 53]
```

### 54. Chat – Private V.2
```
Private chat V.2 varianti (o'ng tomonda kontakt profili paneli va h.k., rasmga qarab).
03-dagi ChatPanel'ni ham real ma'lumotga ula.
[Rasm: 54]
```

### 55. Chat – Team V.1
```
Team suhbat: guruh nomi/avatar, a'zolar soni, xabarlarda jo'natuvchi ismi, a'zolar ro'yxati.
[Rasm: 55]
```

### 56. Invite New Members
```
InviteMembersModal: userlarni qidirish, multi-select, POST /conversations/:id/members,
a'zolarga socket orqali xabar.
[Rasm: 56]
```

### 57. Chat – Team V.2
```
Team chat V.2 varianti.
[Rasm: 57]
```

---

# TASKS (58–69)

### TASK-B. Tasks backend
```
boards (name, project?, members[], columns[{id, title, order, color}]), tasks (board, columnId,
order (fractional), title, description, assignees[], labels[], dueDate, priority, checklist[],
attachments[], coverImage), taskComments, labels (scope: task) modullari.
GET /boards/:id (columns + tasks), PATCH /tasks/:id/move { columnId, order }, CRUD.
```

### 58. Task Board V.1
```
/tasks/board: kanban ustunlar (sarlavha, count, "+"), TaskCard (labellar, sarlavha, assignee
avatarlar, due date, comment/attachment soni). dnd-kit bilan ustunlar ichida va orasida
ko'chirish, optimistic update.
[Rasm: 58]
```

### 59. Task Board [Add, More]
```
Ustun ostida "Add task" inline forma, ustun "..." menyusi (rename, delete, clear), "Add column".
[Rasm: 59]
```

### 60. Task Board – Filter
```
Filter popover: assignee, label, priority, due date. URL'da saqlansin.
[Rasm: 60]
```

### 61. Task Details V.1
```
TaskDetailsModal: sarlavha (inline edit), description (Tiptap), checklist (progress bilan),
attachments, comments (yozish va ro'yxat), o'ngda meta ma'lumot.
[Rasm: 61]
```

### 62. Task Details [Assign To & Set Due Date]
```
Assign To popover (user qidirish, multi-select) va Set Due Date popover (DatePicker qayta ishlatilsin).
[Rasm: 62]
```

### 63. Task Details [Labels]
```
Labels popover: mavjud labellardan tanlash (rangli), qidirish, "Create new label" link.
[Rasm: 63]
```

### 64. Add New Label
```
Task uchun AddLabelModal (49-dagi komponent scope prop bilan qayta ishlatilsin).
[Rasm: 64]
```

### 65. Task Details V.2
```
TaskDetails V.2 varianti (yon panel ko'rinishida, rasmga qarab).
[Rasm: 65]
```

### 66. Task Board V.2
```
Board V.2 varianti: TaskCard'ning cover rasmli va boshqa ko'rinishi.
[Rasm: 66]
```

### 67. Task Board V.3
```
Board V.3 varianti.
[Rasm: 67]
```

### 68. Task List V.1
```
/tasks/list: tasklar ustun (status) bo'yicha guruhlangan ro'yxat, checkbox bilan bajarildi,
inline edit, sort. Board bilan bir xil ma'lumot.
[Rasm: 68]
```

### 69. Task List V.2
```
Task List V.2 varianti.
[Rasm: 69]
```

---

# PROJECT MANAGEMENT (70–79)

### PROJ-B. Projects backend
```
projects moduli: name, description, client, coverColor/icon, members[], status
(ongoing/hold/done), progress (tasklardan avto hisoblanadi), startDate, endDate, budget, tags[].
CRUD, filter (status, member, date), GET /projects/:id/tasks (Gantt uchun start/end bilan).
Har yangi projectga avtomatik board yaratilsin.
```

### 70. Project Management V.1 [Grid]
```
/projects: ProjectCard grid (ikonka, nom, client, progress bar, a'zolar avatarlari, deadline,
tasklar soni, "..."), status tablar, search, grid/list/gantt toggle, "+ Add Project".
[Rasm: 70]
```

### 71. Projects – Filter
```
Filter popover: status, a'zo, sana oralig'i.
[Rasm: 71]
```

### 72. Add Project
```
AddProjectModal: nom, description, client, a'zolar (multi-select), start/end date, budget, rang/ikonka.
[Rasm: 72]
```

### 73. Edit Project
```
EditProject: 72-dagi forma edit rejimida, qo'shimcha status va Delete.
[Rasm: 73]
```

### 74. Project Details
```
/projects/[id]: header (nom, progress, a'zolar), tablar (Overview, Tasks → board embed,
Files, Activity), statistika kartalari.
[Rasm: 74]
```

### 75. Project Management V.2 [Grid]
```
Grid V.2 varianti (ProjectCard variant prop).
[Rasm: 75]
```

### 76. Project Management V.3 [Grid]
```
Grid V.3 varianti.
[Rasm: 76]
```

### 77. Project Management [List]
```
?view=list: DataTable (nom, client, a'zolar, progress, status, deadline, "...").
[Rasm: 77]
```

### 78. Project Management [Gantt Chart]
```
?view=gantt: chapda project/task daraxti, o'ngda vaqt shkalasi (kun/hafta/oy), barlar progress
bilan, bugungi kun chizig'i. Bar drag qilinsa sana PATCH bo'lsin.
[Rasm: 78]
```

### 79. Task Preview [Gantt Chart]
```
Gantt'dagi barni bosganda TaskPreview popover/drawer (nom, sana, assignee, progress, Open task).
[Rasm: 79]
```

---

# FILE MANAGER (80–84)

### FILE-B. Files backend
```
folders (name, parent, owner, color) va files (name, folder, owner, size, mimeType, storageKey,
sharedWith[], isStarred) modullari. GET /files?folderId (folderlar + fayllar), breadcrumbs,
upload (multipart, bir nechta), rename, move, delete (S3'dan ham), GET /files/:id/download
(presigned URL), GET /files/storage (ishlatilgan joy, turlar bo'yicha).
```

### 80. File Manager [Grid]
```
/files/[[...folderId]]: chapda storage widget (turlar bo'yicha progress), quick access;
o'ngda breadcrumb, folder kartalari, fayl kartalari (tur ikonkasi/preview, nom, hajm, sana).
[Rasm: 80]
```

### 81. Menu Folder
```
Folder/fayl "..." menyusi va o'ng tugma context menu: Open, Rename, Move, Share, Download, Delete.
[Rasm: 81]
```

### 82. File Manager [List]
```
?view=list: DataTable (nom + ikonka, egasi, hajm, sana, "...").
[Rasm: 82]
```

### 83. Upload V.1
```
UploadModal: drag & drop zona, fayllar ro'yxati har biri progress bilan, bekor qilish.
[Rasm: 83]
```

### 84. Upload V.2
```
Upload V.2: pastki burchakda minimize qilinadigan upload progress paneli (rasmga qarab).
[Rasm: 84]
```

---

# NOTES (85–87)

### NOTE-B. Notes backend
```
notes moduli: owner, title, content (html), color, tags[], isPinned. CRUD, search, filter by tag.
```

### 85. Notes
```
/notes: rangli NoteCard'lar masonry grid'da (pinned yuqorida), search, teg filterlari, "+".
[Rasm: 85]
```

### 86. Note Details
```
NoteDetails modal/panel: to'liq kontent, inline tahrirlash (autosave debounce), rang, pin, delete.
[Rasm: 86]
```

### 87. Add Note
```
AddNoteModal: title, Tiptap kontent, rang tanlash, teglar.
[Rasm: 87]
```

---

# CONTACTS (88–94)

### CONT-B. Contacts backend
```
contacts moduli: owner, firstName, lastName, email, phone, company, jobTitle, avatar,
address, isFavorite, tags[]. CRUD, search, filter (favorite), A-Z sort.
```

### 88. Contacts V.1 [List]
```
/contacts: DataTable (avatar+ism, lavozim, email, telefon, kompaniya, "..."), search, "+",
list/grid toggle.
[Rasm: 88]
```

### 89. Contacts V.2 [List]
```
List V.2 varianti (alifbo bo'yicha guruhlangan va h.k., rasmga qarab).
[Rasm: 89]
```

### 90. Contacts V.1 [Grid]
```
?view=grid: ContactCard (avatar, ism, lavozim, email/telefon/chat ikonkalari).
[Rasm: 90]
```

### 91. Contacts V.2 [Grid]
```
Grid V.2 varianti (ContactCard variant prop).
[Rasm: 91]
```

### 92. Contacts V.3 [Grid]
```
Grid V.3 varianti.
[Rasm: 92]
```

### 93. Add Contact
```
Add Contact: 12-dagi AddContactModal qayta ishlatilib, real POST /contacts ga ulansin.
[Rasm: 93]
```

### 94. Edit Contact
```
Edit Contact: shu forma edit rejimida, Delete tugmasi bilan. 10-dagi ContactsList ham real ma'lumotga ulansin.
[Rasm: 94]
```

---

# MY PROFILE (95–96)

### PROF-B. Profile backend
```
GET/PATCH /users/me (profil maydonlari), POST /users/me/avatar, PATCH /users/me/password
(eski parol tekshiruvi), GET /users/:id (public profil).
```

### 95. My Profile V.1
```
/profile: cover + avatar, ism, lavozim, Edit profile; tablar (About, Activity, Projects, Settings).
Settings tabida profil formasi va parol o'zgartirish.
[Rasm: 95]
```

### 96. My Profile V.2
```
Profile V.2 varianti (08-dagi ProfileSidebar qayta ishlatilsin).
[Rasm: 96]
```

---

# TIMELINE (97)

### ACT-B. Activity backend
```
activities moduli: actor, action, entityType, entityId, meta, createdAt.
EventEmitter2 orqali: products, orders, tasks, projects, files servislari event emit qilsin,
ActivityListener yozsin. GET /activities?entityType&cursor. Yangi activity socket orqali push.
```

### 97. Timeline
```
/timeline: vertikal timeline (sana guruhlari, ikonka, actor avatar, matn, vaqt), infinite scroll.
04-dagi RecentActivity widgetini ham shu endpointga ula.
[Rasm: 97]
```

---

# INTEGRATSIYA (I1–I5)

### I1. Wallet / Cards backend
```
cards (owner, brand, last4, holder, expMonth, expYear, balance) va transactions (owner, type
income/expense, category, amount, title, date) modullari. 02, 10, 11 dagi mock'larni real
endpointlarga almashtir.
```

### I2. Notifications backend
```
notifications moduli (user, type, title, payload, isRead, TTL 90 kun), /notifications
socket namespace, GET /notifications, PATCH read/read-all. Yangi chat xabari, task assign,
yangi order kabi hodisalarda notification yaratilsin. 05-dagi dropdown'ni ula.
```

### I3. Dashboard aggregation
```
dashboard moduli: GET /dashboard/overview?from&to (income, sales, new clients + % o'zgarish),
/dashboard/statistics (kunlik income/expense), /dashboard/sales, /dashboard/tasks-summary,
/dashboard/projects-summary. MongoDB aggregation ($facet, $group), Redis cache 5 min.
01–12 dagi mock datani real endpointlarga almashtir (mock faqat bo'sh holatda).
```

### I4. Export
```
export moduli: GET /:resource/export?format=xlsx|csv|pdf (products, orders, customers,
contacts), joriy filterlarni hisobga olsin (exceljs, pdfkit). 5000 qatordan ko'p bo'lsa
BullMQ job + tayyor bo'lganda notification. ExportMenu'ni barcha joyda ula.
```

### I5. Sifat va deploy
```
- Har modul uchun asosiy e2e testlar (auth, products CRUD, orders)
- Loading skeletonlar, error boundary, 404 sahifa, empty statelar barcha sahifalarda
- Dark mode (tokenlar orqali)
- Dockerfile (web, api), GitHub Actions (lint, typecheck, test, build)
- Production env hujjati (MongoDB Atlas, Redis, S3)
```
