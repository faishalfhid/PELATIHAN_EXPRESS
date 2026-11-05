require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const app = express();
const { body, validationResult } = require("express-validator");
const port = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const path = require("path");
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")),
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")),
);

app.use(express.static(path.join(__dirname, "public")));

const validasiBarang = [
  body("nama").isString().bail().trim().notEmpty(),
  body("harga").isString().bail().isInt({ min: 0, max: 2147483647 }),
  body("stok").isString().bail().isInt({ min: 0, max: 2147483647 }),
];
function cekDataBarang(req, res, next) {
  if (!validationResult(req).isEmpty()) {
    return res
      .status(422)
      .type("text/plain")
      .send("Data tidak valid. Isi nama, harga, dan stok dengan benar.");
  }
  next();
}
function cekIdBarang(req, res, next) {
  const id = Number(req.params.id);
  if (
    !/^[0-9]+$/.test(req.params.id) ||
    !Number.isInteger(id) ||
    id < 1 ||
    id > 2147483647
  ) {
    return res.status(400).type("text/plain").send("ID barang tidak valid.");
  }
  req.barangId = id;
  next();
}
function cekIdKaryawan(req, res, next) {
  const id = Number(req.params.id);
  if (
    !/^[0-9]+$/.test(req.params.id) ||
    !Number.isInteger(id) ||
    id < 1 ||
    id > 2147483647
  ) {
    return res.status(400).type("text/plain").send("ID karyawan tidak valid.");
  }
  req.karyawanId = id;
  next();
}

app.get("/", (req, res) => {
  const dataPengguna = { namaPengguna: "Faishal Fariz" };
  res.render("index", dataPengguna);
});

app.get("/kontak", (req, res) => {
  res.render("kontak");
});

app.post("/post", (req, res) => {
  res.send("Ini adalah rute POST");
});

app.get("/kosongan", (req, res) => {
  res.send("Ini teks aja");
});

app.get("/form", (req, res) => {
  res.render("form");
});

const aturanForm = [
  body("nama")
    .isString()
    .withMessage("Nama harus berupa teks")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Nama tidak boleh kosong"),
  body("email")
    .isString()
    .withMessage("Format email tidak valid")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Format email tidak valid"),
];

app.post("/submit-form", aturanForm, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("form", {
      errors: errors.array(),
      values: req.body,
    });
  }
  // Respons teks menjaga isian pengguna tetap menjadi teks, bukan kode HTML.
  res
    .type("text/plain")
    .send(`Sukses! Nama: ${req.body.nama}, Email: ${req.body.email}`);
});

app.get("/barang", async (req, res, next) => {
  try {
    const barangs = await prisma.barang.findMany({ orderBy: { id: "asc" } });
    res.render("barang", { listBarang: barangs });
  } catch (err) {
    next(err);
  }
});

app.get("/barang/tambah", (req, res) => {
  res.render("tambah-barang");
});

app.post(
  "/barang/tambah",
  validasiBarang,
  cekDataBarang,
  async (req, res, next) => {
    try {
      const { nama, harga, stok } = req.body;
      await prisma.barang.create({
        data: { nama, harga: Number(harga), stok: Number(stok) },
      });
      res.redirect("/barang");
    } catch (err) {
      next(err);
    }
  },
);

app.get("/barang/edit/:id", cekIdBarang, async (req, res, next) => {
  try {
    const barang = await prisma.barang.findUnique({
      where: { id: req.barangId },
    });
    if (!barang) {
      return res.status(404).type("text/plain").send("Barang tidak ditemukan.");
    }
    res.render("edit-barang", { b: barang });
  } catch (err) {
    next(err);
  }
});

app.post(
  "/barang/edit/:id",
  cekIdBarang,
  validasiBarang,
  cekDataBarang,
  async (req, res, next) => {
    try {
      const { nama, harga, stok } = req.body;
      await prisma.barang.update({
        where: { id: req.barangId },
        data: { nama, harga: Number(harga), stok: Number(stok) },
      });
      res.redirect("/barang");
    } catch (err) {
      next(err);
    }
  },
);

app.post("/barang/hapus/:id", cekIdBarang, async (req, res, next) => {
  try {
    await prisma.barang.delete({
      where: { id: req.barangId },
    });
    res.redirect("/barang");
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "P2025") {
    return res
      .status(404)
      .type("text/plain")
      .send("Barang tidak ditemukan atau sudah dihapus.");
  }
  console.error(err.message);
  res
    .status(500)
    .type("text/plain")
    .send("Operasi gagal. Periksa koneksi dan pesan pada terminal.");
});

app.get("/karyawan/tambah", (req, res) => {
  res.render("tambah-karyawan");
});

app.get("/karyawan", async (req, res, next) => {
  try {
    const karyawans = await prisma.karyawan.findMany({
      orderBy: { id: "asc" },
    });
    res.render("karyawan", { listKaryawan: karyawans });
  } catch (err) {
    next(err);
  }
});

app.post(
  "/karyawan/tambah",
  async (req, res, next) => {
    try {
      const { nama, divisi } = req.body;
      await prisma.karyawan.create({
        data: { nama, divisi },
      });
      res.redirect("/karyawan");
    } catch (err) {
      next(err);
    }
  },
);

app.get("/karyawan/edit/:id",cekIdKaryawan, async (req, res, next) => {
  try {
    const karyawan = await prisma.karyawan.findUnique({
      where: { id: req.karyawanId },
    });
    if (!karyawan) {
      return res.status(404).type("text/plain").send("Karyawan tidak ditemukan.");
    }
    res.render("edit-karyawan", { k: karyawan });
  } catch (err) {
    next(err);
  }
});

app.post(
  "/karyawan/edit/:id",
  cekIdKaryawan,
  async (req, res, next) => {
    try {
      const { nama, divisi } = req.body;
      await prisma.karyawan.update({
        where: { id: req.karyawanId },
        data: { nama, divisi},
      });
      res.redirect("/karyawan");
    } catch (err) {
      next(err);
    }
  },
);

app.post("/karyawan/hapus/:id", cekIdKaryawan, async (req, res, next) => {
  try {
    await prisma.karyawan.delete({
      where: { id: req.karyawanId },
    });
    res.redirect("/karyawan");
  } catch (err) {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
