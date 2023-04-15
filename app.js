// Import semua package yang dibutuhkan
const express = require("express");
const Car = require("./model/car");
const multer = require("multer");
const path = require("path");
require("./utils/db");

// Panggil framework express
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ejs
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//set multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});
app.use(express.static(path.join(__dirname, "public/images")));

app.get("/", async (req, res) => {
  const date = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "UTC",
  };
  const cars = await Car.find();
  res.render("index", {
    cars,
    date,
  });
});

app.get("/add-new-car", (req, res) => {
  res.render("add-new-car");
});

app.post("/add-new-car", upload.single("image"), (req, res) => {
  const { name, price, size } = req.body;
  const image = req.file.filename;

  const Posting = new Car({
    name: name,
    price: price,
    size: size,
    image: image,
  });
  Posting.save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/edit-car/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  res.render("update-car", {
    car,
    sizeOptions: ["small", "medium", "large"],
  });
});

app.post("/edit-car/:id", upload.single("image"), (req, res) => {
  const { name, price, size } = req.body;
  const image = req.file.filename;

  const id = req.params.id;

  Car.findById(id)
    .then((car) => {
      if (!car) {
        const err = new Error("Mobil tidak ditemukan");
        throw err;
      }

      car.name = name;
      car.price = price;
      car.size = size;
      car.image = image;

      return car.save();
    })

    .then(() => {
      res.redirect("/");
      // res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  Car.findById(id)
    .then((car) => {
      if (!car) {
        const err = new Error("Mobil tidak ditemukan");
        err.errorStatus = 404;
        throw err;
      }
      return Car.findByIdAndDelete(id);
    })
    .then(() => {
      res.redirect("/");
      // res.json(result);
    })
    .catch((err) => {
      next(err);
    });
  // if (!car) {
  //   res.status(404);
  //   res.send("<h1>(404) Halaman Tidak Ditemukan</h1>");
  // } else {
  //   Car.deleteOne({ _id: car._id }).then((result) => {
  //     res.redirect("/");
  //   });
  // }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
