require("dotenv").config();
const express = require("express");
const app = express();
const	{	body,	validationResult	}	=	require('express-validator');
const port = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.urlencoded({	extended:	true	}));

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

app.get("/karyawan", (req, res) => {
  const dataKaryawan = [
    { id: 1, nama: "Budi	Santoso", divisi: "IT" },
    { id: 2, nama: "Siti	Aminah", divisi: "Finance" },
    { id: 3, nama: "Agus	Setiawan", divisi: "Marketing" },
  ];
  res.render("karyawan", { listKaryawan: dataKaryawan });
});

app.get("/form", (req, res) => {
  res.render("form");
});

const aturanForm = [
  body('nama').isString().withMessage('Nama harus berupa teks').bail()
    .trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('email').isString().withMessage('Format email tidak valid').bail()
    .trim().isEmail().withMessage('Format email tidak valid')
];

app.post('/submit-form', aturanForm, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('form', {
      errors: errors.array(),
      values: req.body
    });
  }
  // Respons teks menjaga isian pengguna tetap menjadi teks, bukan kode HTML.
  res.type('text/plain').send(
    `Sukses! Nama: ${req.body.nama}, Email: ${req.body.email}`
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
