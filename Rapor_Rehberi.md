# Proje Raporu Hazırlama Rehberi (Genişletilmiş - 6 Sayfa)

Bu rehber, **Cristobal** projesi için hazırlamanız gereken Word dokümanının içeriğini belirler. İstediğiniz **2 ekstra hata kontrolü** (Unique Email & Admin Yetkisi) ilgili sayfalara "Alternatif/Ekstra" olarak eklenmiştir. Yer durumuna göre bunları sayfaların altına sıkıştırabilirsiniz.

---

## Sayfa 1: Kapak Sayfası

Word'ün ilk sayfasını tamamen kapak tasarımına ayırın.

- **Ekran Görüntüsü:** Ana sayfanın en üstündeki "CRISTOBAL / Her Katmanda Zarafet" yazan Hero bölümü.

---

## Sayfa 2: Proje Tanıtımı ve Arayüz (Frontend)

- **Ekran Görüntüsü:** Ana Sayfa (Home Page) - Koleksiyonlar kısmı.
- **Gerçek Kod (`views/public/index.html`):**
  ```html
  <!-- views/public/index.html: Navbar -->
  <nav class="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 ...">
    <div class="relative flex items-center justify-between h-20">
      <h1 class="font-serif text-2xl font-bold ...">CRISTOBAL</h1>
      <div class="hidden md:flex items-center space-x-6">
        <a href="/products">Ürünler</a>
      </div>
    </div>
  </nav>
  ```

---

## Sayfa 3: Dinamik Ürün Listeleme (Backend)

- **Ekran Görüntüsü:** Ürünler Sayfası (`/products`).
- **Gerçek Kod (`routes/api.js`):**
  ```javascript
  // routes/api.js: Ürünleri Listeleme
  router.get("/products", (req, res) => {
    const category = req.query.category;
    let query = "SELECT * FROM products";
    let params = [];
    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  ```

---

## Sayfa 4: Üyelik Sistemi ve GÜVENLİK (Genişletilmiş)

Bu sayfaya **Login Hata Kontrolü**'nün yanına (veya altına) **Kayıt (Duplicate Email) Kontrolü** ekleyebilirsiniz.

### 1. Login Kontrolü (Mevcut)

- **Ekran Görüntüsü:** Giriş ekranında hatalı şifre uyarısı.
- **Kod:**
  ```javascript
  // routes/auth.js: Login Kontrolü
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id };
    res.json({ success: true });
  } else {
    return res.status(401).json({ error: "Hatalı email veya şifre." });
  }
  ```

### 2. EKSTRA KONTROL: Mükerrer Kayıt Engelleme (Yeni)

- **Ekran Görüntüsü:** Kayıt Ol sayfasında (`/auth/register`), zaten kayıtlı bir mail adresiyle (örn: admin@cristobal.com) tekrar kayıt olmaya çalışın. Çıkan **"Bu email adresi zaten kullanımda"** uyarısını çekin.
- **Kod (`routes/auth.js`):**
  ```javascript
  // routes/auth.js: Kayıt (Duplicate Email) Kontrolü
  const stmt = db.prepare(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
  );
  stmt.run(username, email, hashedPassword, function (err) {
    if (err) {
      // Veritabanı UNIQUE kısıtlaması hatası
      if (err.message.includes("UNIQUE constraint failed")) {
        return res
          .status(400)
          .json({ error: "Bu email adresi zaten kullanımda." });
      }
      return res.status(500).json({ error: "Kayıt hatası." });
    }
    res.json({ success: true, redirectUrl: "/auth/login" });
  });
  ```

---

## Sayfa 5: İletişim Formu ve YETKİ KONTROLÜ (Genişletilmiş)

Bu sayfaya **İletişim Formu**'nun yanına **Admin Yetki Kontrolü** ekleyebilirsiniz.

### 1. İletişim Formu (Mevcut)

- **Ekran Görüntüsü:** İletişim formunda boş alan uyarısı.
- **Kod:** `contact.html` içindeki `required` kodları.

### 2. EKSTRA KONTROL: Admin Yetki Koruması (Yeni)

- **Ekran Görüntüsü:** Giriş yapmadan tarayıcı adres çubuğuna `http://localhost:3000/admin` yazıp Enter'a basın. Sistem sizi otomatik olarak **Login sayfasına** atacaktır. Bu yönlendirmenin ekran görüntüsünü (Login sayfası ve üstte adres çubuğu) koyabilirsiniz.
- **Kod (`routes/admin.js`):**

  ```javascript
  // routes/admin.js: Middleware Yetki Kontrolü
  const isAdmin = (req, res, next) => {
    // Kullanıcı giriş yapmış mı VE rolü 'admin' mi?
    if (req.session.user && req.session.user.role === "admin") {
      return next();
    }
    // Değilse giriş yapmaya zorla
    res.redirect("/auth/login");
  };

  // Tüm admin rotalarında bu kontrolü uygula
  router.use(isAdmin);
  ```

---

## Sayfa 6: Sepet Yönetimi ve Sonuç

- **Ekran Görüntüsü:** Sepet Sayfası.
- **Kod:** `cart.html` render fonksiyonu.
