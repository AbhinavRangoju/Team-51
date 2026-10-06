globalThis.__nitro_main__ = import.meta.url;
import { NodeResponse, serve } from "./_libs/srvx.mjs";
import { H3Core, HTTPError, composeMiddleware, createMatcherFromFind, defineHandler, defineLazyEventHandler, headers, memoizeRouteRulesMatcher, toEventHandler } from "./_libs/h3+rou3+srvx.mjs";
import { HookableCore } from "./_libs/hookable.mjs";
import { decodePath, joinURL, withLeadingSlash, withoutTrailingSlash } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/account-DmJZgOfl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4281-8Kth6hSqTLJ/5ywkO0rvD71Kt+8\"",
		"mtime": "2026-10-06T05:57:08.205Z",
		"size": 17025,
		"path": "../public/assets/account-DmJZgOfl.js"
	},
	"/assets/arrow-right-BEFLtsay.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cd-Qqv2bHkdXViuDYOjN/GUWMPsPF4\"",
		"mtime": "2026-10-06T05:57:08.207Z",
		"size": 205,
		"path": "../public/assets/arrow-right-BEFLtsay.js"
	},
	"/assets/arrow-left-DUmf8vjZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cd-vH3Te+Qqz4jhQqVke/RwKWfKypI\"",
		"mtime": "2026-10-06T05:57:08.206Z",
		"size": 205,
		"path": "../public/assets/arrow-left-DUmf8vjZ.js"
	},
	"/assets/button-C0ApXoG0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"803-ox76XwOYIO3Q/LpoN3ZhJUlRdVY\"",
		"mtime": "2026-10-06T05:57:08.210Z",
		"size": 2051,
		"path": "../public/assets/button-C0ApXoG0.js"
	},
	"/assets/checkout-1rqzxq5G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"362b-AVVSLX1QhBVB4D4afTlKxQ9Fur0\"",
		"mtime": "2026-10-06T05:57:08.213Z",
		"size": 13867,
		"path": "../public/assets/checkout-1rqzxq5G.js"
	},
	"/assets/badge-check-DsT-3GiO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17e-JIVT2gTgGjjwCuslCvJrUXgejSY\"",
		"mtime": "2026-10-06T05:57:08.208Z",
		"size": 382,
		"path": "../public/assets/badge-check-DsT-3GiO.js"
	},
	"/assets/clock-C732mPnk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-XLK7nHcSdlj/8P1sOxjT3QgIVmY\"",
		"mtime": "2026-10-06T05:57:08.214Z",
		"size": 209,
		"path": "../public/assets/clock-C732mPnk.js"
	},
	"/assets/categories-CMGCiOX_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20e4-JMEuEE14XAf4WxQDS7GBLDu0O8k\"",
		"mtime": "2026-10-06T05:57:08.212Z",
		"size": 8420,
		"path": "../public/assets/categories-CMGCiOX_.js"
	},
	"/assets/banknote-DjSc3h_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d-2pVa3IvK6ExbjQvQEEgig08DhmY\"",
		"mtime": "2026-10-06T05:57:08.209Z",
		"size": 285,
		"path": "../public/assets/banknote-DjSc3h_V.js"
	},
	"/assets/cart-yPVX-5m0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1882-DhFiKdI5JxZd9Eh6Z4tjRhLZO3k\"",
		"mtime": "2026-10-06T05:57:08.212Z",
		"size": 6274,
		"path": "../public/assets/cart-yPVX-5m0.js"
	},
	"/assets/credit-card-CQ4mzzys.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11b-ledpc/YL5WSRdE0c+gtATPYGbBc\"",
		"mtime": "2026-10-06T05:57:08.218Z",
		"size": 283,
		"path": "../public/assets/credit-card-CQ4mzzys.js"
	},
	"/assets/createClientRpc-zssALIwR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8237-xG6jnnvL3FEh5i0Hp1fyVpUY3qE\"",
		"mtime": "2026-10-06T05:57:08.216Z",
		"size": 33335,
		"path": "../public/assets/createClientRpc-zssALIwR.js"
	},
	"/assets/createLucideIcon-BHt4-bHC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c48-LeByYZZzHviKK0m8DUzHSUgEMvo\"",
		"mtime": "2026-10-06T05:57:08.217Z",
		"size": 3144,
		"path": "../public/assets/createLucideIcon-BHt4-bHC.js"
	},
	"/assets/dist-uGaPAaxw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8fce-8TIZGHE+UU26b5YXUS2Ns67ClJQ\"",
		"mtime": "2026-10-06T05:57:08.220Z",
		"size": 36814,
		"path": "../public/assets/dist-uGaPAaxw.js"
	},
	"/assets/deals-BpWbDN-u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bf0-1Z/ruwfQT4nxVMh6t1Vlf+XMqEc\"",
		"mtime": "2026-10-06T05:57:08.219Z",
		"size": 11248,
		"path": "../public/assets/deals-BpWbDN-u.js"
	},
	"/assets/login-B3PODlJ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"55dc-XHpNDdNEM1BZ69zRc04kDpM4Vj4\"",
		"mtime": "2026-10-06T05:57:08.223Z",
		"size": 21980,
		"path": "../public/assets/login-B3PODlJ4.js"
	},
	"/assets/hero-DssTZWSH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31-1FpqYwyyTGIhzeRPhcP4ZMgvs1Q\"",
		"mtime": "2026-10-06T05:57:08.221Z",
		"size": 49,
		"path": "../public/assets/hero-DssTZWSH.js"
	},
	"/assets/info-DEv1Knb7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-+Jp+eEng0cQd6jGGC29TiuYMQ+s\"",
		"mtime": "2026-10-06T05:57:08.222Z",
		"size": 244,
		"path": "../public/assets/info-DEv1Knb7.js"
	},
	"/assets/hero-CLVfncrX.jpg": {
		"type": "image/jpeg",
		"etag": "\"1c9ba-ppy44ld+ubRAhyHuHvKohTQx+d8\"",
		"mtime": "2026-10-06T05:57:08.266Z",
		"size": 117178,
		"path": "../public/assets/hero-CLVfncrX.jpg"
	},
	"/assets/minus-B4K3FkNe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d-DS0OmbyKF0I2TSyq1dzBbuSY4fY\"",
		"mtime": "2026-10-06T05:57:08.225Z",
		"size": 157,
		"path": "../public/assets/minus-B4K3FkNe.js"
	},
	"/assets/map-pin-Brhv4cTl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12b-FB+hwKvaIc06tq/DXCo+mIKhRRc\"",
		"mtime": "2026-10-06T05:57:08.224Z",
		"size": 299,
		"path": "../public/assets/map-pin-Brhv4cTl.js"
	},
	"/assets/notifications-CKCh3HJx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1082-S9jL1G3/bLX22Mf4dIqzquq/rEE\"",
		"mtime": "2026-10-06T05:57:08.226Z",
		"size": 4226,
		"path": "../public/assets/notifications-CKCh3HJx.js"
	},
	"/assets/LegalPage-ByffnCtp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d99-4DaZZC0w0Fy3bELHfiJ3Y7xwiOQ\"",
		"mtime": "2026-10-06T05:57:08.201Z",
		"size": 3481,
		"path": "../public/assets/LegalPage-ByffnCtp.js"
	},
	"/assets/onboarding-mcwHksN_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772a-0qkuMLbCQAuVOvjKBxO8NnZ4Vrs\"",
		"mtime": "2026-10-06T05:57:08.228Z",
		"size": 30506,
		"path": "../public/assets/onboarding-mcwHksN_.js"
	},
	"/assets/index-hbTrCjMb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5794a-5XFGRa2yKHzcXyO/IkFss/5ppO4\"",
		"mtime": "2026-10-06T05:57:08.200Z",
		"size": 358730,
		"path": "../public/assets/index-hbTrCjMb.js"
	},
	"/assets/onboarding-store-Bstm17DA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"219-cVY2rNuKKbKvL5fOPC41fKNFlVc\"",
		"mtime": "2026-10-06T05:57:08.230Z",
		"size": 537,
		"path": "../public/assets/onboarding-store-Bstm17DA.js"
	},
	"/assets/orders-pUwsFAEm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"226a-x8X9nv+J2cQ5Ojer24CMK8H+uKs\"",
		"mtime": "2026-10-06T05:57:08.231Z",
		"size": 8810,
		"path": "../public/assets/orders-pUwsFAEm.js"
	},
	"/assets/p-bag-COQRx_Bt.jpg": {
		"type": "image/jpeg",
		"etag": "\"c58a-wGP+wVCwQqx73TrsXT9W8qXfWvs\"",
		"mtime": "2026-10-06T05:57:08.267Z",
		"size": 50570,
		"path": "../public/assets/p-bag-COQRx_Bt.jpg"
	},
	"/assets/p-books-D1rvbkHM.jpg": {
		"type": "image/jpeg",
		"etag": "\"15e39-N2AupqN7qeDGEmaPxW/e/Oiq6ps\"",
		"mtime": "2026-10-06T05:57:08.268Z",
		"size": 89657,
		"path": "../public/assets/p-books-D1rvbkHM.jpg"
	},
	"/assets/p-serum-BBfdQ-hB.jpg": {
		"type": "image/jpeg",
		"etag": "\"d3fd-Fyd0veQmtieLWtJ2B9LEOgu3QPg\"",
		"mtime": "2026-10-06T05:57:08.272Z",
		"size": 54269,
		"path": "../public/assets/p-serum-BBfdQ-hB.jpg"
	},
	"/assets/p-sneaker-meaC7ob3.jpg": {
		"type": "image/jpeg",
		"etag": "\"109cd-0E9hmejGApjH2exlTdxLxhxmWWE\"",
		"mtime": "2026-10-06T05:57:08.273Z",
		"size": 68045,
		"path": "../public/assets/p-sneaker-meaC7ob3.jpg"
	},
	"/assets/p-coffee-DKWCxrXx.jpg": {
		"type": "image/jpeg",
		"etag": "\"1488b-mhk0/OUo8FB8oDKi8FTtOzL5nSc\"",
		"mtime": "2026-10-06T05:57:08.269Z",
		"size": 84107,
		"path": "../public/assets/p-coffee-DKWCxrXx.jpg"
	},
	"/assets/p-laptop-D4BrPoN1.jpg": {
		"type": "image/jpeg",
		"etag": "\"a317-Xy+e/Xds+Q79y4y5Yq6aDmhQ1BM\"",
		"mtime": "2026-10-06T05:57:08.271Z",
		"size": 41751,
		"path": "../public/assets/p-laptop-D4BrPoN1.jpg"
	},
	"/assets/p-headphones-Ba_iRbPz.jpg": {
		"type": "image/jpeg",
		"etag": "\"c75b-ozU3o1Mdgalnu7JLEHLjm4iTrT4\"",
		"mtime": "2026-10-06T05:57:08.270Z",
		"size": 51035,
		"path": "../public/assets/p-headphones-Ba_iRbPz.jpg"
	},
	"/assets/p-vase-Cf4mCF7V.jpg": {
		"type": "image/jpeg",
		"etag": "\"f179-og4vvGpAzeQR7jRfVvi9M8K71OI\"",
		"mtime": "2026-10-06T05:57:08.275Z",
		"size": 61817,
		"path": "../public/assets/p-vase-Cf4mCF7V.jpg"
	},
	"/assets/p-watch-CDfMXCU3.jpg": {
		"type": "image/jpeg",
		"etag": "\"b44e-mrkFMgylYCupIURvhmg9oQD29os\"",
		"mtime": "2026-10-06T05:57:08.276Z",
		"size": 46158,
		"path": "../public/assets/p-watch-CDfMXCU3.jpg"
	},
	"/assets/plus-Dkm8VVMr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-bnUjAEItFzs25s5q9REmC4ag3n0\"",
		"mtime": "2026-10-06T05:57:08.234Z",
		"size": 193,
		"path": "../public/assets/plus-Dkm8VVMr.js"
	},
	"/assets/package-search-C3jzq7P2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"200-ue6q839AlE9/piMj20RwaZ9zeaA\"",
		"mtime": "2026-10-06T05:57:08.233Z",
		"size": 512,
		"path": "../public/assets/package-search-C3jzq7P2.js"
	},
	"/assets/p-sweater-BfMJAiD_.jpg": {
		"type": "image/jpeg",
		"etag": "\"17ac8-83yGDCkGJoBILg8MNMI8gcKX8rs\"",
		"mtime": "2026-10-06T05:57:08.274Z",
		"size": 96968,
		"path": "../public/assets/p-sweater-BfMJAiD_.jpg"
	},
	"/assets/privacy-DqcGno9R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12db-imWU/fNDqDlLcfN0RIU5YBfxdZA\"",
		"mtime": "2026-10-06T05:57:08.236Z",
		"size": 4827,
		"path": "../public/assets/privacy-DqcGno9R.js"
	},
	"/assets/p-yoga-DLIYn89B.jpg": {
		"type": "image/jpeg",
		"etag": "\"102ce-IbCJFMpMM8ErpxbywtnyAxhjVjw\"",
		"mtime": "2026-10-06T05:57:08.277Z",
		"size": 66254,
		"path": "../public/assets/p-yoga-DLIYn89B.jpg"
	},
	"/assets/preload-helper-iAIIpWQs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13bd-Id5hVBlrEJPGd8btZOEltk/cR4s\"",
		"mtime": "2026-10-06T05:57:08.235Z",
		"size": 5053,
		"path": "../public/assets/preload-helper-iAIIpWQs.js"
	},
	"/assets/ProductCard-Bt3HSWIh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c8b-BC9FPOrBXxeQzlsEggha3E6Gw9w\"",
		"mtime": "2026-10-06T05:57:08.203Z",
		"size": 3211,
		"path": "../public/assets/ProductCard-Bt3HSWIh.js"
	},
	"/assets/product._id-DSxTU-93.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3267-nshDvheMXo/rKb3abZP/S0WN8SU\"",
		"mtime": "2026-10-06T05:57:08.237Z",
		"size": 12903,
		"path": "../public/assets/product._id-DSxTU-93.js"
	},
	"/assets/RequireAuth-Bd4FDzMJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"809-0SK6l+bKAsFa4o/zFft8Ol8cSLE\"",
		"mtime": "2026-10-06T05:57:08.203Z",
		"size": 2057,
		"path": "../public/assets/RequireAuth-Bd4FDzMJ.js"
	},
	"/assets/rolldown-runtime-CbXtAM7H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24d-+aXgvbJ1Wwcp2A8AXKIBByksYC8\"",
		"mtime": "2026-10-06T05:57:08.239Z",
		"size": 589,
		"path": "../public/assets/rolldown-runtime-CbXtAM7H.js"
	},
	"/assets/returns-A6gxZlXJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1389-UqrYlHYJcnLfuVwg2nvwnMYOHkw\"",
		"mtime": "2026-10-06T05:57:08.238Z",
		"size": 5001,
		"path": "../public/assets/returns-A6gxZlXJ.js"
	},
	"/assets/rotate-ccw-B-tIiEou.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0-P9v/BjTG9z1oA1i50RE1HUq7N/U\"",
		"mtime": "2026-10-06T05:57:08.241Z",
		"size": 240,
		"path": "../public/assets/rotate-ccw-B-tIiEou.js"
	},
	"/assets/search-x-CgFHXYq9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"129-bvBtMkQRnQazdVxGEuY6avLFr2o\"",
		"mtime": "2026-10-06T05:57:08.243Z",
		"size": 297,
		"path": "../public/assets/search-x-CgFHXYq9.js"
	},
	"/assets/routes-BewLv7vI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2301-EEduGsC+yh0g5vV/IpQUzN9Bys8\"",
		"mtime": "2026-10-06T05:57:08.242Z",
		"size": 8961,
		"path": "../public/assets/routes-BewLv7vI.js"
	},
	"/assets/seller-policy-DaFSfChw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"184c-r3NNVqcwsvHpIpA/wJyDn4z4QjI\"",
		"mtime": "2026-10-06T05:57:08.244Z",
		"size": 6220,
		"path": "../public/assets/seller-policy-DaFSfChw.js"
	},
	"/assets/shop-BT3Rwh4I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e1e-Us/a3nBCeTk31loVjH6uXh9IWmQ\"",
		"mtime": "2026-10-06T05:57:08.246Z",
		"size": 7710,
		"path": "../public/assets/shop-BT3Rwh4I.js"
	},
	"/assets/shield-check-BtxFNLi8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168-Yk4gt/wXnndu3ub5D7RR8gdaJCg\"",
		"mtime": "2026-10-06T05:57:08.245Z",
		"size": 360,
		"path": "../public/assets/shield-check-BtxFNLi8.js"
	},
	"/assets/shopping-bag-CZKjszYk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1dc-+ODVRGbQiGiqsyJJgJyBE76123Q\"",
		"mtime": "2026-10-06T05:57:08.247Z",
		"size": 476,
		"path": "../public/assets/shopping-bag-CZKjszYk.js"
	},
	"/assets/StoreLayout-BOMKkcfl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b27b-i9MDXQMTLS7oCSD63xZ82QGtPiE\"",
		"mtime": "2026-10-06T05:57:08.204Z",
		"size": 111227,
		"path": "../public/assets/StoreLayout-BOMKkcfl.js"
	},
	"/assets/store-D-ydyFA3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5d63-m6IG5gXLvUZB/HOTlKkW+KzAbxw\"",
		"mtime": "2026-10-06T05:57:08.248Z",
		"size": 23907,
		"path": "../public/assets/store-D-ydyFA3.js"
	},
	"/assets/tag-CYRx7ou4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e-kAFoJCgpYC/cf9k53c1tqVmYgQM\"",
		"mtime": "2026-10-06T05:57:08.250Z",
		"size": 366,
		"path": "../public/assets/tag-CYRx7ou4.js"
	},
	"/assets/terms-C70uFvwA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1620-oXcY9xTk0aRvHb6mkvPPoQj/JxM\"",
		"mtime": "2026-10-06T05:57:08.251Z",
		"size": 5664,
		"path": "../public/assets/terms-C70uFvwA.js"
	},
	"/assets/trending-down-iENwfTaY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"da-umfSU9MI5KsVSyteMHcYB3iiyCM\"",
		"mtime": "2026-10-06T05:57:08.253Z",
		"size": 218,
		"path": "../public/assets/trending-down-iENwfTaY.js"
	},
	"/assets/trash-BVL8Y-Mr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"182-u3/zlPyVcICe/yLd1qBk8vhqeSM\"",
		"mtime": "2026-10-06T05:57:08.252Z",
		"size": 386,
		"path": "../public/assets/trash-BVL8Y-Mr.js"
	},
	"/assets/styles-BszQBf3D.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b4c9-4php+7EJCtCcZCn6clr3zvbb4yE\"",
		"mtime": "2026-10-06T05:57:08.279Z",
		"size": 111817,
		"path": "../public/assets/styles-BszQBf3D.css"
	},
	"/assets/trending-up-_1K-eQrJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d7-wELz8UaOG2X9dMvEtr9zGamb5Mw\"",
		"mtime": "2026-10-06T05:57:08.254Z",
		"size": 215,
		"path": "../public/assets/trending-up-_1K-eQrJ.js"
	},
	"/assets/useNavigate-BcJ5QqhB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20fc-psbx/Kob6WF1Y2/u08iMt99K+qE\"",
		"mtime": "2026-10-06T05:57:08.257Z",
		"size": 8444,
		"path": "../public/assets/useNavigate-BcJ5QqhB.js"
	},
	"/assets/user-UA7j0F1X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c2-b0R14GV4tabq6sZP70Hr8GD8dVc\"",
		"mtime": "2026-10-06T05:57:08.258Z",
		"size": 706,
		"path": "../public/assets/user-UA7j0F1X.js"
	},
	"/assets/vendor-DbumhVgv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a5f-cf5qCnqFcR/2YgFf9HZZHdbmWQw\"",
		"mtime": "2026-10-06T05:57:08.261Z",
		"size": 19039,
		"path": "../public/assets/vendor-DbumhVgv.js"
	},
	"/assets/truck-BoQgUmFv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1be-F+ANuA+HBgHQk014uP9W6upZwgo\"",
		"mtime": "2026-10-06T05:57:08.255Z",
		"size": 446,
		"path": "../public/assets/truck-BoQgUmFv.js"
	},
	"/assets/useMatch-DrUYCtiU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"246-+ZaLxB6s5EQ8YS3nPGbDoY7s2gA\"",
		"mtime": "2026-10-06T05:57:08.256Z",
		"size": 582,
		"path": "../public/assets/useMatch-DrUYCtiU.js"
	},
	"/assets/vendor-register-pglfTO4h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4e76-VO7RCBvuFd/KcXxNxY76BQMN2dQ\"",
		"mtime": "2026-10-06T05:57:08.262Z",
		"size": 20086,
		"path": "../public/assets/vendor-register-pglfTO4h.js"
	},
	"/assets/vendors-BSRT0j9T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b8c-0b3WFq0LSXR9ffv0OemTeBe03UI\"",
		"mtime": "2026-10-06T05:57:08.263Z",
		"size": 11148,
		"path": "../public/assets/vendors-BSRT0j9T.js"
	},
	"/assets/wallet-DKQw-bJa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"146-ZiotRUmRC9n1VfQeiI4lS/ma9XI\"",
		"mtime": "2026-10-06T05:57:08.264Z",
		"size": 326,
		"path": "../public/assets/wallet-DKQw-bJa.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/assets/**",
		rank: 0,
		rules: [{
			name: "headers",
			route: "/assets/**",
			handler: headers,
			options: { "cache-control": "public, max-age=31536000, immutable" }
		}]
	};
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		let s = p.split("/");
		let l = s.length;
		let _w;
		if (l > 1) {
			if (s[1] === "assets") r.push(l > 2 ? {
				data: $0,
				params: {
					"0": _w = p.slice(8),
					_: _w
				}
			} : {
				data: $0,
				params: {}
			});
		}
		return r.reverse();
	};
})();
var _lazy_d2680a6c8a74775e = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_d2680a6c8a74775e
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => {
		event.context.routeRules = getRouteRules(event.req.method, event.url.pathname).routeRules;
		return findRoute(event.req.method, event.url.pathname);
	};
	h3App["~middleware"].push(createRouteRulesMiddleware());
	h3App["~middleware"].push(...globalMiddleware);
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
var _matchRouteRules;
function getRouteRules(method, pathname) {
	return (_matchRouteRules ??= memoizeRouteRulesMatcher(createMatcherFromFind(findRouteRules)))(method, pathname);
}
function createRouteRulesMiddleware() {
	const composed = /* @__PURE__ */ new WeakMap();
	const middleware = (event, next) => {
		const ruleMiddleware = getRouteRules(event.req.method, event.url.pathname).routeRuleMiddleware;
		if (ruleMiddleware.length === 0) return next();
		let chain = composed.get(ruleMiddleware);
		if (!chain) {
			chain = composeMiddleware(ruleMiddleware);
			composed.set(ruleMiddleware, chain);
		}
		return chain(event, next);
	};
	return markUntraced(middleware);
}
function markUntraced(middleware) {
	middleware.__traced__ = true;
	return middleware;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/runtime/internal/shutdown.mjs
function setupCloseHooks(server) {
	const closeServer = server.close.bind(server);
	let closeHooks;
	server.close = (closeActiveConnections) => closeServer(closeActiveConnections).finally(() => closeHooks ??= callCloseHooks());
}
async function callCloseHooks() {
	try {
		await useNitroHooks().callHook("close");
	} catch (error) {
		console.error("[nitro] Error while calling `close` hooks:", error);
	}
}
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
setupCloseHooks(serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
}));
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
