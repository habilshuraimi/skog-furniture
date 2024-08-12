import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import bcrypt from "bcrypt";
import { getBestSellingCategories,getBestSellingProducts } from "./bestSellingController.js";

//here we load login page for admin
export const adminLoginLoad = (req, res) => {
  res.render("adminLogin");
};

//here we check the login credentials of admin
export const verifyAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  const userData = await User.findOne({ $and: [{ email }, { isAdmin: true }] });
  if (userData) {
    const isMatch = bcrypt.compare(password, userData.password);

    if (isMatch) {
      req.session.Admin = userData._id;
      res.redirect("/admin/adminHome");
    } else {
      res.render("adminLogin", { error: "password does not match" });
    }
  } else {
    return res.render("adminLogin", { error: "admin Not found" });
  }
};

//here we load admin dashboard page
export const loadAdminHome = async (req, res) => {
  try {
    const admin = await User.find({ isAdmin: true });
    const usersCount = await User.find().countDocuments();
    const productsCount = await Product.find().countDocuments();
    const ordersCount = await Order.find({
      status: "Pending",
    }).countDocuments();
    const confirmedOrders = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: "$billTotal" },
        },
      },
    ]).exec();

    res.render("adminHome", {
      admin,
      usersCount,
      productsCount,
      ordersCount,
      confirmedOrders,
      totalRevenue: confirmedOrders[0] ? confirmedOrders[0].totalRevenue : 0,
    });
  } catch (error) {
    console.log(error);
  }
};

//here we load best selling page
export const loadBestSeling = async (req, res) => {
  try {
    const admin = await User.find({ isAdmin: true });
    const usersCount = await User.find().countDocuments();
    const productsCount = await Product.find().countDocuments();
    const ordersCount = await Order.find({
      status: "Pending",
    }).countDocuments();
    const confirmedOrders = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: "$billTotal" },
        },
      },
    ]).exec();

    //best selling
    let bestSellingProducts = await getBestSellingProducts();
    let bestSellingCategories = await getBestSellingCategories();

    res.render("bestSelling", {
      admin,
      usersCount,
      productsCount,
      ordersCount,
      totalRevenue: confirmedOrders[0] ? confirmedOrders[0].totalRevenue : 0,
      bestSellingProducts,
      bestSellingCategories
    });
  } catch (error) {
    console.log(error);
  }
};

//here we logout admin
export const adminlogOut = (req, res) => {
  req.session.destroy();

  res.redirect("/admin/");
};

export const getChartData = async (req, res) => {
  try {
      const timeBaseForSalesChart = req.query.salesChart;
      const timeBaseForOrderNoChart = req.query.orderChart;
      const timeBaseForOrderTypeChart = req.query.orderType;
      const timeBaseForCategoryBasedChart = req.query.categoryChart;

      function getDatesAndQueryData(timeBaseForChart, chartType) {
          let startDate, endDate;
          let groupingQuery, sortQuery;

          if (timeBaseForChart === "yearly") {
              startDate = new Date(new Date().getFullYear(), 0, 1);
              endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

              groupingQuery = {
                  _id: {
                      month: { $month: { $toDate: "$createdAt" } },
                      year: { $year: { $toDate: "$createdAt" } }
                  },
                  totalSales: { $sum: "$billTotal" },
                  totalOrder: { $sum: 1 }
              };
              sortQuery = { "_id.year": 1, "_id.month": 1 };
          }

          if (timeBaseForChart === "weekly") {
              startDate = new Date();
              endDate = new Date();

              const timeZoneOffset = startDate.getTimezoneOffset();

              startDate.setDate(startDate.getDate() - 6);
              startDate.setUTCHours(0, 0, 0, 0);
              startDate.setUTCMinutes(startDate.getUTCMinutes() + timeZoneOffset);

              endDate.setUTCHours(0, 0, 0, 0);
              endDate.setDate(endDate.getDate() + 1);
              endDate.setUTCMinutes(endDate.getUTCMinutes() + timeZoneOffset);

              groupingQuery = {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  totalSales: { $sum: "$billTotal" },
                  totalOrder: { $sum: 1 }
              };

              sortQuery = { _id: 1 };
          }

          if (timeBaseForChart === "daily") {
              startDate = new Date();
              endDate = new Date();

              const timezoneOffset = startDate.getTimezoneOffset();

              startDate.setUTCHours(0, 0, 0, 0);
              endDate.setUTCHours(0, 0, 0, 0);
              endDate.setDate(endDate.getDate() + 1);

              startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);
              endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);

              groupingQuery = {
                  _id: { $hour: "$createdAt" },
                  totalSales: { $sum: "$billTotal" },
                  totalOrder: { $sum: 1 }
              };

              sortQuery = { "_id.hour": 1 };
          }

          if (chartType === "sales") {
              return { groupingQuery, sortQuery, startDate, endDate };
          } else if (chartType === "orderType") {
              return { startDate, endDate };
          } else if (chartType === "categoryBasedChart") {
              return { startDate, endDate };
          } else if (chartType === "orderNoChart") {
              return { groupingQuery, sortQuery, startDate, endDate };
          }
      }

      const salesChartInfo = getDatesAndQueryData(timeBaseForSalesChart, "sales");
      const orderChartInfo = getDatesAndQueryData(timeBaseForOrderTypeChart, "orderType");
      const categoryBasedChartInfo = getDatesAndQueryData(timeBaseForCategoryBasedChart, "categoryBasedChart");
      const orderNoChartInfo = getDatesAndQueryData(timeBaseForOrderNoChart, "orderNoChart");

      const salesChartData = await Order.aggregate([
          {
              $match: {
                  createdAt: { $gte: salesChartInfo.startDate, $lte: salesChartInfo.endDate },
                  status: { $nin: ["Canceled", "Failed", "Refunded"] },
                  paymentStatus: { $nin: ["Pending", "Processing", "Canceled", "Returned"] }
              }
          },
          { $group: salesChartInfo.groupingQuery },
          { $sort: salesChartInfo.sortQuery }
      ]).exec();

      const orderNoChartData = await Order.aggregate([
          {
              $match: {
                  createdAt: { $gte: orderNoChartInfo.startDate, $lte: orderNoChartInfo.endDate },
                  status: { $nin: ["Canceled", "Returned"] },
                  paymentStatus: { $nin: ["Pending", "Failed", "Refunded", "Cancelled"] }
              }
          },
          { $group: orderNoChartInfo.groupingQuery },
          { $sort: orderNoChartInfo.sortQuery }
      ]).exec();

      const orderChartData = await Order.aggregate([
          {
              $match: {
                  createdAt: { $gte: orderChartInfo.startDate, $lte: orderChartInfo.endDate },
                  status: { $nin: ["Pending", "Processing", "Canceled", "Returned"] },
                  paymentStatus: { $nin: ["Pending", "Refunded", "Cancelled", "Failed"] }
              }
          },
          { $group: { _id: "$paymentMethod", totalOrder: { $sum: 1 } } }
      ]).exec();

      const categoryWiseChartData = await Order.aggregate([
          {
              $match: {
                  createdAt: { $gte: categoryBasedChartInfo.startDate, $lte: categoryBasedChartInfo.endDate },
                  status: { $nin: ["Pending", "Processing", "Canceled", "Returned"] },
                  paymentStatus: { $nin: ["Pending", "Failed"] }
              }
          },
          { $unwind: "$items" },
          {
              $lookup: {
                  from: "products",
                  localField: "items.productId",
                  foreignField: "_id",
                  as: "productInfo"
              }
          },
          { $unwind: "$productInfo" },
          {
              $lookup: {
                  from: "categories",
                  localField: "productInfo.category",
                  foreignField: "_id",
                  as: "catInfo"
              }
          },
          { $addFields: { categoryInfo: { $arrayElemAt: ["$catInfo", 0] } } },
          { $addFields: { catName: "$categoryInfo.name" } },
          { $group: { _id: "$catName", count: { $sum: 1 } } }
      ]).exec();

      let saleChartInfo = {
          timeBasis: timeBaseForSalesChart,
          data: salesChartData
      };

      let orderTypeChartInfo = {
          timeBasis: timeBaseForOrderTypeChart,
          data: orderChartData
      };

      let categoryChartInfo = {
          timeBasis: timeBaseForCategoryBasedChart,
          data: categoryWiseChartData
      };

      let orderQuantityChartInfo = {
          timeBasis: timeBaseForOrderNoChart,
          data: orderNoChartData
      };

      return res.status(200).json({
          saleChartInfo,
          orderTypeChartInfo,
          categoryChartInfo,
          orderQuantityChartInfo
      });
  } catch (error) {
      console.log("error while getting chart Data", error.message);
      return res.status(500).json({ error: "Something went wrong" });
  }
};