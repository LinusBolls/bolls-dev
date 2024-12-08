import fs from "fs";
import { join } from "path";

import nodeHtmlToImage from "node-html-to-image";
import QRCode from "qrcode";
import sharp from "sharp";

const assetsDir = join(__dirname, "../assets");
const outDir = join(__dirname, "../out");

const avatarPath = join(assetsDir, "avatar.webp");
const bannerPath = join(outDir, "banner.webp");

const avatarSizeRem = 15;

await resizeToSquare(
  avatarPath,
  join(outDir, "avatar.resized.webp"),
  avatarSizeRem * 16 * 3
);

const vcard = `BEGIN:VCARD
VERSION:3.0
TITLE:Fullstack Freelancer
N;CHARSET=UTF-8:Bolls;Linus;;;
FN;CHARSET=UTF-8: Linus Bolls
URL;PRIVATE:https://linus.bolls.dev

X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/LinusBolls
X-SOCIALPROFILE;type=GitHub:https://github.com/LinusBolls
X-SOCIALPROFILE;type=Signal:https://signal.me/#eu/PbhDuwWbCVgYmJV6bcCik-F8ng2Glqk6uOjMcr0LaSmwqUHiZmBGDZ4vBCb4NkLb

EMAIL:linus@bolls.dev
END:VCARD`;

const vcardDataUri =
  "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);

const faviconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_833_121)">
<path d="M12 0H4C1.79086 0 0 1.79086 0 4V12C0 14.2091 1.79086 16 4 16H12C14.2091 16 16 14.2091 16 12V4C16 1.79086 14.2091 0 12 0Z" fill="black"/>
<path d="M4.37109 13V4.87988H6.08008V11.6816H7.10059V13H4.37109Z" fill="white"/>
<path d="M9.58789 9.28125V7.74805C9.58789 7.57878 9.56348 7.46973 9.51465 7.4209C9.46908 7.37207 9.37142 7.34766 9.22168 7.34766H9.08984V9.68164C9.10612 9.68164 9.13216 9.68327 9.16797 9.68652C9.20378 9.68978 9.22819 9.69141 9.24121 9.69141C9.36491 9.69141 9.4528 9.67188 9.50488 9.63281C9.56022 9.59049 9.58789 9.52214 9.58789 9.42773V9.28125ZM9.58789 5.49219V4.58887C9.58789 4.4196 9.56348 4.31055 9.51465 4.26172C9.46908 4.21289 9.37142 4.18848 9.22168 4.18848H9.08984V5.8877C9.10612 5.8877 9.13216 5.89095 9.16797 5.89746C9.20378 5.90072 9.22819 5.90234 9.24121 5.90234C9.36491 5.90234 9.4528 5.88118 9.50488 5.83887C9.56022 5.79655 9.58789 5.72982 9.58789 5.63867V5.49219ZM7.37109 11V2.87988H9.3291C10.182 2.87988 10.7256 2.97754 10.96 3.17285C11.1943 3.36491 11.3115 3.82715 11.3115 4.55957V5.40918C11.3115 5.78353 11.2497 6.06836 11.126 6.26367C11.0055 6.45573 10.8102 6.58105 10.54 6.63965C10.8298 6.75033 11.0299 6.90169 11.1406 7.09375C11.2546 7.28581 11.3115 7.58529 11.3115 7.99219V9.31055C11.3115 10.0495 11.1927 10.5166 10.9551 10.7119C10.7207 10.904 10.182 11 9.33887 11H7.37109Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_833_121">
<rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>`;

const addContactSvg = `<svg style="position: absolute; top: -4.5rem; left: -12rem" width="243" height="57" viewBox="0 0 243 57" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M156.197 21.4922C154.82 21.601 153.616 20.5733 153.508 19.1969C153.399 17.8204 154.427 16.6165 155.803 16.5078L156.197 21.4922ZM237.445 54.5232C237.156 55.8734 235.827 56.7336 234.477 56.4446L212.475 51.7357C211.125 51.4467 210.265 50.118 210.554 48.7678C210.843 47.4177 212.171 46.5574 213.522 46.8464L233.079 51.0321L237.264 31.4751C237.553 30.1249 238.882 29.2647 240.232 29.5536C241.582 29.8426 242.443 31.1714 242.154 32.5215L237.445 54.5232ZM155.803 16.5078C176.372 14.8831 191.551 15.7423 204.224 21.2245C216.963 26.7351 226.814 36.7562 237.099 52.6414L232.901 55.3586C222.868 39.8613 213.687 30.7658 202.239 25.8136C190.726 20.8331 176.564 19.8835 156.197 21.4922L155.803 16.5078Z" fill="white"/>
<path d="M17.2566 38.3594C16.6397 38.3898 15.9576 37.7201 15.2104 36.3504C14.7176 35.4681 14.2709 34.4406 13.8703 33.2679C13.3018 33.4039 12.3676 33.5719 11.0676 33.7719C9.84539 33.9651 8.91253 34.1487 8.26899 34.3226C7.98588 35.2101 7.47595 36.5526 6.73919 38.3502C6.44577 38.9405 5.99554 39.2622 5.38848 39.3153C4.96043 39.3528 4.56258 39.2425 4.19495 38.9845C3.82663 38.7187 3.62273 38.3601 3.58324 37.9087C3.54851 37.5118 3.99886 36.1157 4.93427 33.7204C4.80421 33.4886 4.73776 33.267 4.73494 33.0555C4.73339 32.6792 5.08532 32.3543 5.79074 32.0809C6.72839 30.0696 7.78443 27.9774 8.95888 25.8043C10.6465 22.6844 11.716 21.1047 12.1674 21.0652C13.0235 20.9903 13.6408 21.4578 14.0194 22.4677C14.2479 23.2869 14.6023 24.5146 15.0827 26.1508C15.7535 28.3507 16.5577 30.8644 17.4952 33.6919C17.5688 33.905 17.8122 34.4013 18.2254 35.1808C18.5642 35.8256 18.7482 36.3153 18.7774 36.65C18.8169 37.1014 18.6787 37.4938 18.3629 37.8273C18.0547 38.1601 17.686 38.3375 17.2566 38.3594ZM11.8542 26.7626C11.3384 27.8586 10.626 29.3522 9.71705 31.2433C10.0605 31.1348 10.5998 31.0249 11.3351 30.9135C12.202 30.7828 12.7469 30.692 12.9699 30.6411C12.6946 29.6457 12.3227 28.3529 11.8542 26.7626ZM28.8309 25.1715C28.6999 22.5087 28.6602 20.6653 28.7117 19.6413C28.7637 18.7114 29.2294 18.2079 30.1089 18.131C30.5681 18.0908 30.9507 18.2063 31.2567 18.4776C31.5628 18.7488 31.7345 19.0984 31.772 19.5265C31.8707 20.655 31.9283 22.3439 31.9447 24.5932C31.9689 26.8419 32.0304 28.5304 32.1291 29.6589C32.3701 32.414 32.621 34.2507 32.8817 35.169C32.916 35.2915 32.9375 35.4033 32.9464 35.5045C32.9838 35.9325 32.8591 36.3003 32.5723 36.6077C32.2849 36.9073 31.9349 37.0752 31.5224 37.1113C30.9465 37.1616 30.4959 36.9423 30.1708 36.4531C29.6695 36.8185 29.1416 37.1039 28.5871 37.3092C28.0332 37.5224 27.4528 37.6555 26.8457 37.7086C25.1024 37.8612 23.6061 37.4313 22.3569 36.4192C21.0823 35.3857 20.368 33.9895 20.2141 32.2306C20.031 30.137 20.4747 28.3964 21.5453 27.0088C22.6153 25.6133 24.1037 24.8322 26.0104 24.6654C26.5941 24.6143 27.121 24.631 27.5911 24.7153C28.0612 24.7997 28.4745 24.9517 28.8309 25.1715ZM28.9192 28.8693C28.6194 28.4014 28.2528 28.0649 27.8192 27.8598C27.3856 27.6546 26.8847 27.5768 26.3166 27.6265C25.1647 27.7273 24.3301 28.1376 23.8127 28.8573C23.2947 29.5692 23.0939 30.5906 23.2103 31.9214C23.2839 32.762 23.6581 33.4546 24.3332 33.9994C25.0082 34.5442 25.7583 34.7805 26.5832 34.7084C27.1825 34.6559 27.6317 34.5461 27.9307 34.3787C28.1327 34.267 28.4689 33.9866 28.9394 33.5376C29.0622 33.4171 29.18 33.2852 29.293 33.142C29.2447 32.7698 29.1201 31.3456 28.9192 28.8693ZM42.8866 23.9418C42.7556 21.279 42.7159 19.4356 42.7674 18.4116C42.8194 17.4817 43.2851 16.9782 44.1646 16.9013C44.6237 16.8611 45.0064 16.9766 45.3124 17.2479C45.6185 17.5191 45.7902 17.8687 45.8277 18.2968C45.9264 19.4253 45.984 21.1142 46.0004 23.3635C46.0246 25.6121 46.086 27.3007 46.1848 28.4292C46.4258 31.1843 46.6767 33.021 46.9374 33.9393C46.9717 34.0618 46.9932 34.1736 47.0021 34.2748C47.0395 34.7028 46.9148 35.0705 46.628 35.378C46.3405 35.6776 45.9906 35.8455 45.5781 35.8815C45.0022 35.9319 44.5516 35.7126 44.2265 35.2234C43.7252 35.5888 43.1973 35.8742 42.6428 36.0795C42.0889 36.2927 41.5085 36.4258 40.9014 36.4789C39.1581 36.6314 37.6618 36.2016 36.4126 35.1895C35.138 34.156 34.4237 32.7598 34.2698 31.0009C34.0867 28.9073 34.5304 27.1667 35.601 25.7791C36.671 24.3836 38.1593 23.6025 40.0661 23.4357C40.6498 23.3846 41.1767 23.4013 41.6468 23.4856C42.1169 23.57 42.5301 23.722 42.8866 23.9418ZM42.9748 27.6396C42.6751 27.1717 42.3084 26.8352 41.8749 26.63C41.4413 26.4249 40.9404 26.3471 40.3722 26.3968C39.2204 26.4976 38.3858 26.9078 37.8684 27.6275C37.3504 28.3395 37.1496 29.3609 37.266 30.6917C37.3395 31.5323 37.7138 32.2249 38.3889 32.7697C39.0639 33.3145 39.8139 33.5508 40.6389 33.4787C41.2382 33.4262 41.6874 33.3164 41.9864 33.149C42.1884 33.0372 42.5246 32.7569 42.9951 32.3079C43.1178 32.1874 43.2357 32.0555 43.3487 31.9123C43.3004 31.5401 43.1758 30.1159 42.9748 27.6396ZM65.2244 34.5509C63.5122 34.7007 62.0337 34.3399 60.7889 33.4685C59.4772 32.5481 58.7477 31.2474 58.6007 29.5663C58.4652 28.0175 58.8739 26.3701 59.8269 24.6242C60.9074 22.6318 62.2726 21.5634 63.9226 21.4191C64.732 21.3483 65.6966 21.4835 66.8166 21.8247C68.1788 22.2466 68.8906 22.8078 68.9519 23.5082C68.9853 23.8896 68.8826 24.2397 68.6438 24.5586C68.3916 24.9022 68.0436 25.0934 67.6 25.1322C67.2654 25.1615 66.845 25.0179 66.3389 24.7015C65.84 24.3765 65.1196 24.2552 64.1779 24.3376C63.5786 24.3901 62.9802 25.0345 62.3825 26.271C61.8126 27.4658 61.5638 28.4757 61.6359 29.3007C61.7074 30.1179 62.0594 30.7341 62.6917 31.1493C63.2909 31.5439 64.0496 31.701 64.968 31.6207C65.4895 31.5751 66.1103 31.3208 66.8305 30.8578C67.5507 30.3948 68.012 30.1545 68.2143 30.1368C68.6346 30.1 69.0059 30.2205 69.3282 30.4981C69.6582 30.7751 69.8403 31.1082 69.8744 31.4973C69.9275 32.1044 69.319 32.7693 68.0491 33.4921C66.9131 34.1326 65.9715 34.4855 65.2244 34.5509ZM76.9411 33.4788C75.5013 33.6047 74.2206 33.2188 73.099 32.321C71.8681 31.3386 71.1464 29.9469 70.934 28.1461C70.729 26.4309 71.0657 24.8565 71.9441 23.4229C72.9882 21.7317 74.5648 20.7939 76.6739 20.6093C78.2305 20.4732 79.5224 20.9875 80.5497 22.1524C81.4728 23.201 82.0068 24.5541 82.1518 26.2118C82.3098 28.0174 81.9621 29.6006 81.1087 30.9614C80.1515 32.4803 78.7623 33.3194 76.9411 33.4788ZM76.7918 23.7046C75.8339 23.7806 75.1171 24.2824 74.6414 25.2102C74.2391 25.9905 74.0812 26.8748 74.1677 27.8632C74.2494 28.7971 74.5767 29.49 75.1495 29.9418C75.6045 30.3019 76.1122 30.4575 76.6725 30.4085C77.3496 30.3492 77.9171 30.0682 78.3751 29.5655C78.8962 28.9788 79.1361 28.2245 79.0946 27.3027C78.9766 24.7878 78.209 23.5885 76.7918 23.7046ZM93.9276 32.1338C92.9703 32.2176 92.396 31.7934 92.2047 30.8612C92.0256 30.0691 91.8461 29.2731 91.6664 28.4732C91.4747 27.6273 91.3459 26.8269 91.2798 26.072C91.2621 25.8696 91.2435 25.5223 91.224 25.0299C91.2122 24.5369 91.1975 24.1892 91.1798 23.9868C91.175 23.9324 91.1709 23.7955 91.1674 23.5762C91.1632 23.3491 91.155 23.1656 91.1427 23.0255C91.0862 22.3795 90.8906 22.0712 90.5559 22.1004C89.8399 22.1631 89.1724 22.645 88.5532 23.5461C87.9412 24.4388 87.4968 25.5442 87.22 26.8624C87.2269 27.1206 87.2218 27.4661 87.2048 27.8989C87.1888 28.2533 87.1954 28.5977 87.2246 28.9324C87.2437 29.1503 87.296 29.479 87.3815 29.9186C87.4741 30.3496 87.53 30.6741 87.549 30.8921C87.5878 31.3357 87.4642 31.7151 87.1781 32.0303C86.9004 32.3526 86.5281 32.5342 86.0611 32.575C85.5942 32.6159 85.196 32.5017 84.8666 32.2325C84.5379 31.9711 84.3541 31.6186 84.3153 31.175C84.2962 30.957 84.2443 30.6322 84.1594 30.2005C84.0739 29.7609 84.0216 29.4322 84.0026 29.2143C83.9372 28.4671 83.9008 27.4234 83.8933 26.083C83.8858 24.7426 83.8494 23.6988 83.7841 22.9517C83.7636 22.7182 83.7178 22.3732 83.6465 21.9168C83.5823 21.4519 83.5403 21.1065 83.5205 20.8808C83.4824 20.445 83.6067 20.0734 83.8935 19.766C84.1874 19.4501 84.564 19.2721 85.0232 19.2319C86.0427 19.1427 86.6409 19.706 86.8179 20.9217L86.8408 21.0491C87.877 19.8057 89.0255 19.1288 90.2863 19.0185C91.7572 18.8898 92.8267 19.4157 93.4946 20.5964C93.9404 21.3887 94.2351 22.6059 94.3788 24.2481L94.4513 25.0769C94.4748 25.4356 94.4931 25.6889 94.506 25.8368C94.5591 26.4438 94.7093 27.2189 94.9564 28.1618C95.2114 29.1041 95.3651 29.8749 95.4175 30.4742C95.4557 30.91 95.3317 31.2856 95.0456 31.6008C94.7594 31.916 94.3868 32.0936 93.9276 32.1338ZM104.59 20.8961C104.427 20.9104 104.232 20.9235 104.006 20.9355C103.786 20.939 103.595 20.9479 103.432 20.9622C103.112 20.9901 102.745 21.0536 102.331 21.1526C102.746 24.2846 102.996 26.3331 103.08 27.2982C103.089 27.3994 103.109 27.5897 103.142 27.8692C103.173 28.1409 103.197 28.3624 103.212 28.5336C103.368 30.3237 102.882 31.268 101.754 31.3668C101.326 31.4042 100.945 31.3043 100.61 31.0669C100.243 30.8167 100.041 30.4814 100.004 30.0611C99.98 29.781 99.9549 29.3597 99.9292 28.7973C99.9035 28.2349 99.8784 27.8136 99.8539 27.5334C99.7715 26.5917 99.5251 24.5821 99.1147 21.5046C98.6301 21.5234 97.8931 21.5252 96.9036 21.5098C95.9212 21.4859 95.3906 21.0226 95.3116 20.1198C95.2734 19.684 95.389 19.3014 95.6582 18.972C95.9274 18.6426 96.2954 18.4574 96.7624 18.4166C97.0504 18.3914 97.716 18.3802 98.7593 18.383C98.7297 18.1347 98.6741 17.7239 98.5926 17.1507C98.5179 16.6553 98.4686 16.2714 98.4448 15.999C98.4067 15.5632 98.5346 15.1873 98.8285 14.8715C99.1224 14.5556 99.495 14.3779 99.9464 14.3384C101.098 14.2376 101.759 15.1562 101.929 17.0941L101.989 18.0534C102.465 17.9412 102.855 17.8718 103.159 17.8452C104.054 17.7669 104.67 17.7718 105.007 17.86C105.649 18.0234 106.002 18.4709 106.066 19.2025C106.104 19.6461 105.985 20.0291 105.707 20.3514C105.43 20.6737 105.057 20.8553 104.59 20.8961ZM118.59 29.9173C118.232 29.9486 117.63 29.6092 116.783 28.899C116.097 29.3041 115.489 29.6161 114.96 29.835C114.431 30.0616 113.975 30.1917 113.594 30.225C111.718 30.3891 110.266 30.0104 109.236 29.0888C108.214 28.1665 107.616 26.7053 107.441 24.7051C107.277 22.8295 107.829 21.1656 109.098 19.7136C110.366 18.2537 111.966 17.4394 113.896 17.2705C114.635 17.2058 115.51 17.3411 116.519 17.6762C117.739 18.0793 118.378 18.6155 118.436 19.2848C118.461 19.565 118.393 19.818 118.232 20.0438C118.181 20.3619 118.154 20.7604 118.148 21.2392C118.15 21.7096 118.179 22.2599 118.234 22.8904C118.364 24.3769 118.563 25.4378 118.83 26.0732C118.86 26.1412 119.074 26.5302 119.473 27.2403C119.835 27.8831 120.021 28.2511 120.029 28.3445C120.065 28.757 119.935 29.1134 119.64 29.4137C119.352 29.7134 119.002 29.8812 118.59 29.9173ZM114.994 22.1621C114.972 21.9131 114.963 21.6277 114.966 21.3058C114.977 20.9756 114.999 20.6089 115.035 20.2058C114.872 20.1416 114.727 20.0994 114.6 20.0792C114.48 20.0505 114.377 20.0399 114.292 20.0474C113.233 20.14 112.343 20.6374 111.622 21.5396C110.901 22.434 110.588 23.426 110.683 24.5156C110.774 25.5585 111.03 26.3282 111.45 26.8248C111.869 27.3135 112.452 27.5252 113.199 27.4598C113.682 27.4176 114.13 27.3 114.545 27.1069C114.966 26.9053 115.354 26.6322 115.708 26.2875C115.312 24.4556 115.075 23.0805 114.994 22.1621ZM127.167 29.1316C125.455 29.2814 123.977 28.9206 122.732 28.0492C121.42 27.1288 120.691 25.828 120.544 24.147C120.408 22.5982 120.817 20.9508 121.77 19.2049C122.85 17.2125 124.216 16.1441 125.866 15.9998C126.675 15.929 127.64 16.0641 128.76 16.4053C130.122 16.8273 130.834 17.3885 130.895 18.0889C130.928 18.4703 130.826 18.8204 130.587 19.1393C130.335 19.4829 129.987 19.6741 129.543 19.7129C129.208 19.7422 128.788 19.5986 128.282 19.2821C127.783 18.9572 127.063 18.8359 126.121 18.9183C125.522 18.9707 124.923 19.6152 124.326 20.8517C123.756 22.0465 123.507 23.0564 123.579 23.8814C123.651 24.6986 124.002 25.3148 124.635 25.73C125.234 26.1246 125.993 26.2817 126.911 26.2014C127.433 26.1558 128.053 25.9015 128.774 25.4385C129.494 24.9755 129.955 24.7352 130.157 24.7175C130.578 24.6807 130.949 24.8012 131.271 25.0788C131.601 25.3558 131.783 25.6888 131.817 26.078C131.871 26.685 131.262 27.35 129.992 28.0728C128.856 28.7133 127.915 29.0662 127.167 29.1316ZM141.434 17.6727C141.271 17.687 141.076 17.7001 140.849 17.7121C140.63 17.7156 140.439 17.7245 140.275 17.7388C139.956 17.7667 139.589 17.8302 139.174 17.9292C139.589 21.0612 139.839 23.1097 139.924 24.0748C139.933 24.176 139.953 24.3663 139.985 24.6458C140.017 24.9175 140.04 25.139 140.055 25.3102C140.212 27.1002 139.726 28.0446 138.597 28.1434C138.169 28.1808 137.788 28.0809 137.454 27.8435C137.087 27.5933 136.885 27.258 136.848 26.8377C136.824 26.5576 136.799 26.1363 136.773 25.5739C136.747 25.0115 136.722 24.5902 136.698 24.31C136.615 23.3683 136.369 21.3587 135.958 18.2812C135.474 18.3 134.737 18.3018 133.747 18.2864C132.765 18.2625 132.234 17.7992 132.155 16.8964C132.117 16.4606 132.233 16.078 132.502 15.7486C132.771 15.4192 133.139 15.234 133.606 15.1932C133.894 15.168 134.56 15.1568 135.603 15.1596C135.573 14.9113 135.518 14.5005 135.436 13.9273C135.362 13.4319 135.312 13.048 135.288 12.7756C135.25 12.3398 135.378 11.9639 135.672 11.6481C135.966 11.3322 136.339 11.1545 136.79 11.115C137.942 11.0142 138.603 11.9328 138.772 13.8707L138.833 14.83C139.309 14.7178 139.699 14.6484 140.002 14.6218C140.897 14.5435 141.514 14.5484 141.851 14.6366C142.492 14.8 142.845 15.2475 142.909 15.9791C142.948 16.4227 142.829 16.8057 142.551 17.128C142.273 17.4503 141.901 17.6319 141.434 17.6727Z" fill="white"/>
</svg>`;

async function renderSvgToWebp(
  svgString: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  try {
    await sharp(Buffer.from(svgString))
      .resize(width, height)
      .webp({ quality: 90 }) // 0-100
      .toFile(outputPath);

    console.log(`WEBP file saved to ${outputPath}`);
  } catch (error) {
    console.error("Error converting SVG to WEBP:", error);
    throw error;
  }
}

const links = [
  {
    service: "Email",
    value: "linus@bolls.dev",
    href: "mailto:linus@bolls.dev",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9942 7.2C15.9581 6.29587 15.7443 5.40771 15.3648 4.58627C14.9518 3.68987 14.3674 2.88293 13.6445 2.2109C12.1236 0.785167 10.1191 0 8.00003 0C6.41777 -4.91175e-06 4.87105 0.469184 3.55545 1.34823C2.23986 2.22729 1.21447 3.47672 0.608969 4.93853C0.00346559 6.40034 -0.154961 8.00888 0.153723 9.56073C0.462406 11.1126 1.22434 12.538 2.34316 13.6569C3.83346 15.1472 5.85164 15.9891 7.95921 15.9999C10.0668 16.0106 12.0934 15.1893 13.5989 13.7143L12.8522 12.9524C11.5586 14.2257 9.81513 14.9375 8.00003 14.9333C4.17699 14.9333 1.0667 11.823 1.0667 8C1.0667 4.17697 4.17699 1.06667 8.00003 1.06667C11.7583 1.06667 14.9334 3.9975 14.9334 7.46667V8.66667C14.9334 9.62243 14.096 10.4 13.0667 10.4C12.0374 10.4 11.2 9.62243 11.2 8.66667V4.8H10.1334V5.6917C9.63839 5.23195 9.01539 4.93348 8.34693 4.83582C7.67848 4.73816 6.99613 4.84594 6.39032 5.14487C5.78451 5.4438 5.28383 5.91977 4.95466 6.50969C4.62548 7.09961 4.48333 7.77564 4.54707 8.44817C4.6108 9.12071 4.87739 9.758 5.31152 10.2756C5.74565 10.7932 6.32681 11.1666 6.97799 11.3464C7.62917 11.5263 8.31962 11.5039 8.95783 11.2825C9.59604 11.061 10.1519 10.6508 10.5517 10.1063C11.0652 10.9207 12.0004 11.4667 13.0667 11.4667C14.6841 11.4667 16 10.2106 16 8.66667V7.2H15.9942ZM7.86669 10.4C7.41839 10.4 6.98015 10.2671 6.6074 10.018C6.23465 9.76893 5.94413 9.41493 5.77257 9.00075C5.60101 8.58657 5.55612 8.13082 5.64358 7.69113C5.73104 7.25144 5.94692 6.84756 6.26392 6.53056C6.58092 6.21356 6.9848 5.99768 7.42449 5.91022C7.86418 5.82276 8.31993 5.86765 8.73411 6.03921C9.14829 6.21076 9.50229 6.50129 9.75136 6.87404C10.0004 7.24679 10.1334 7.68503 10.1334 8.13333C10.1327 8.73428 9.89366 9.31042 9.46872 9.73536C9.04378 10.1603 8.46764 10.3993 7.86669 10.4V10.4Z"></path></svg>`,
  },
  {
    service: "Signal",
    value: "linus.69",
    href: "https://signal.me/#eu/PbhDuwWbCVgYmJV6bcCik-F8ng2Glqk6uOjMcr0LaSmwqUHiZmBGDZ4vBCb4NkLb",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.02649 1.732C4.54749 1.732 1.72449 4.331 1.72449 7.5395C1.72449 9.55 2.53699 11.0735 3.82849 12.055H3.82599L3.98249 14.081V14.086C3.98249 14.0965 3.98249 14.104 3.98499 14.1145V14.1195C4.00049 14.216 4.08399 14.289 4.18549 14.289C4.21949 14.289 4.25049 14.2785 4.28199 14.2655L4.28699 14.2605L6.21949 13.146C6.78699 13.276 7.39649 13.344 8.02699 13.344C11.506 13.344 14.3265 10.745 14.3265 7.5365C14.3265 4.331 11.506 1.732 8.02449 1.732H8.02649ZM6.94549 0.479C7.29449 0.4375 7.65099 0.4115 8.01599 0.4115C8.26849 0.4115 8.51599 0.4245 8.76099 0.4455L8.79999 0.0365C8.53949 0.013 8.27899 0 8.01599 0C7.63599 0 7.26099 0.0235 6.88849 0.073L6.94599 0.482L6.94549 0.479ZM9.47699 0.5415C10.0865 0.6535 10.667 0.833 11.2165 1.073L11.386 0.6955C11.2975 0.6565 11.209 0.62 11.1205 0.586C10.6125 0.3855 10.0865 0.2345 9.54999 0.138L9.47699 0.5415ZM15.589 7.5805C15.5785 8.19 15.485 8.7835 15.318 9.3485L15.711 9.4655C15.8905 8.864 15.9895 8.231 16 7.5775L15.589 7.5805ZM4.51599 1.2085C5.05499 0.9505 5.63299 0.745 6.23999 0.607L6.14899 0.206C5.72949 0.3 5.31549 0.425 4.91449 0.586C4.71649 0.6615 4.52399 0.7475 4.33649 0.8385L4.51599 1.2085ZM13.615 2.143C13.1435 1.708 12.6255 1.3385 12.063 1.026L11.8545 1.388C12.396 1.685 12.896 2.0415 13.339 2.4505L13.615 2.143ZM10.12 14.7005C10.75 14.5415 11.349 14.3075 11.909 14.013L11.7005 13.659C11.1745 13.935 10.612 14.151 10.018 14.302L10.12 14.7005ZM2.46899 2.6695C2.89099 2.245 3.36749 1.87 3.89099 1.5525L3.67199 1.201C3.20599 1.4825 2.77099 1.8105 2.37499 2.183C2.30749 2.2455 2.24199 2.3105 2.17449 2.3755L2.46899 2.6695ZM15.456 10.19L15.0785 10.0335C14.844 10.588 14.542 11.109 14.175 11.588L14.5055 11.833C14.891 11.328 15.211 10.7755 15.4535 10.19H15.456ZM13.836 2.9555C14.2395 3.406 14.5835 3.906 14.8595 4.44L15.2295 4.2575C14.938 3.69 14.576 3.161 14.1435 2.6795L13.8335 2.9555H13.836ZM15.5395 4.9585L15.1595 5.12C15.368 5.672 15.5085 6.2555 15.563 6.8595L15.972 6.8205C15.9145 6.1825 15.769 5.5575 15.5395 4.9585V4.9585ZM4.27649 15.232L3.63049 15.516L3.40899 14.8335L3.01849 14.9585L3.30999 15.857C3.33099 15.9115 3.36999 15.9585 3.42199 15.982C3.44799 15.995 3.47649 16 3.50549 16C3.53449 16 3.56299 15.995 3.58899 15.982L4.44299 15.607L4.27649 15.232ZM6.82599 14.4375C6.77399 14.427 6.71899 14.4195 6.66699 14.409L6.35699 14.357C6.31549 14.352 6.27649 14.357 6.24249 14.3725L4.94049 14.94L5.12299 15.31L6.35199 14.776C6.43549 14.789 6.51849 14.802 6.59949 14.815C6.64399 14.8255 6.69349 14.8305 6.73749 14.841L6.82599 14.4375ZM9.30999 14.4505C8.88799 14.521 8.45599 14.5545 8.01549 14.5545C7.83299 14.5545 7.66399 14.544 7.49999 14.5285L7.48699 14.94C7.65349 14.9555 7.82799 14.966 8.01549 14.966C8.47899 14.966 8.93749 14.927 9.37999 14.854L9.30999 14.4505ZM1.02899 4.745C1.27649 4.193 1.59649 3.68 1.97949 3.2085L1.66699 2.9375C1.26049 3.435 0.921987 3.9765 0.661987 4.5575L0.653987 4.5705L1.02899 4.745ZM13.706 12.1405C13.2995 12.573 12.8335 12.958 12.326 13.2915L12.5525 13.6355C13.089 13.2865 13.581 12.875 14.0135 12.4165L13.706 12.1405ZM0.664487 9.7005C0.539487 9.169 0.468987 8.5835 0.450987 7.919H0.0394873C0.0604873 8.6325 0.135987 9.2575 0.268487 9.815L0.664487 9.7005ZM0.377987 5.284C0.179987 5.891 0.0654873 6.5185 0.0369873 7.159L0.448487 7.18C0.474487 6.563 0.586487 5.969 0.771487 5.404L0.377987 5.284ZM3.17749 14.1225L2.78449 12.914C2.77149 12.8725 2.74549 12.841 2.71399 12.815C2.55749 12.6925 2.41449 12.57 2.27399 12.4425L1.99249 12.7395C2.11999 12.8645 2.26349 12.9815 2.41199 13.1015L2.78449 14.2445L3.17749 14.1225ZM1.77349 11.9295C1.37749 11.4685 1.08099 10.9635 0.869987 10.385L0.486987 10.5385C0.515487 10.609 0.541487 10.6815 0.570487 10.752C0.791987 11.2835 1.08599 11.757 1.46649 12.2025L1.77349 11.9295Z"></path></svg>`,
  },
  {
    service: "PayPal",
    value: "paypal.me/LinusBolls",
    href: "https://www.paypal.com/paypalme/LinusBolls",
    icon: `<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.1668 8.07842C7.1668 8.51426 6.82031 8.84596 6.38126 8.84596C6.05277 8.84596 5.80978 8.66018 5.80978 8.31049C5.80978 7.87465 6.1492 7.52495 6.58504 7.52495C6.91738 7.52495 7.16744 7.72873 7.16744 8.07842H7.1668ZM3.38825 6.34665H3.22047C3.16712 6.34665 3.11312 6.38264 3.10605 6.44307L2.95241 7.39703L3.24554 7.3861C3.63831 7.3861 3.94172 7.33274 4.01308 6.87891C4.09536 6.4 3.79195 6.34665 3.38825 6.34665V6.34665ZM13.5308 6.34665H13.3701C13.3058 6.34665 13.2627 6.38264 13.2557 6.44307L13.1059 7.39703L13.3913 7.3861C13.8554 7.3861 14.1768 7.27875 14.1768 6.74327C14.173 6.36464 13.8342 6.34665 13.5302 6.34665H13.5308ZM21.084 1.71442V14.2856C21.084 15.2318 20.3165 16 19.3696 16H2.2273C1.28106 16 0.512878 15.2325 0.512878 14.2856V1.71442C0.512878 0.76818 1.28042 0 2.2273 0H19.3696C20.3159 0 21.084 0.767537 21.084 1.71442V1.71442ZM5.0956 6.54978C5.0956 5.7996 4.51706 5.54954 3.85623 5.54954H2.42786C2.33851 5.54954 2.24916 5.62089 2.24209 5.71732L1.65647 9.36344C1.64554 9.43479 1.69954 9.50615 1.77089 9.50615H2.44972C2.54614 9.50615 2.6355 9.40265 2.64643 9.30237L2.80713 8.35227C2.84313 8.09514 3.27833 8.18449 3.44996 8.18449C4.47142 8.18449 5.09625 7.57766 5.09625 6.54914L5.0956 6.54978ZM8.10275 6.86412H7.42393C7.28829 6.86412 7.28122 7.06083 7.27415 7.15725C7.06716 6.85384 6.76696 6.79984 6.42754 6.79984C5.55265 6.79984 4.88475 7.56738 4.88475 8.41398C4.88475 9.11016 5.32059 9.564 6.01678 9.564C6.33819 9.564 6.73803 9.38915 6.96302 9.13909C6.94502 9.19245 6.92702 9.30687 6.92702 9.36087C6.92702 9.44315 6.96302 9.50358 7.04144 9.50358H7.65599C7.75241 9.50358 7.83469 9.40008 7.85269 9.2998L8.21718 7.00362C8.22811 6.93548 8.17411 6.86412 8.10275 6.86412V6.86412ZM9.54912 10.3605L11.8241 7.05311C11.8421 7.03511 11.8421 7.01712 11.8421 6.99269C11.8421 6.93226 11.7887 6.86798 11.7277 6.86798H11.0418C10.9813 6.86798 10.9171 6.90398 10.8811 6.95733L9.93481 8.35034L9.54205 7.01133C9.51376 6.9329 9.43469 6.86862 9.34534 6.86862H8.67744C8.61637 6.86862 8.56302 6.9329 8.56302 6.99333C8.56302 7.0364 9.2592 9.0221 9.32027 9.21109C9.22385 9.34673 8.58809 10.2325 8.58809 10.3399C8.58809 10.4042 8.64144 10.4543 8.70251 10.4543H9.38841C9.45269 10.4511 9.51312 10.4151 9.54912 10.3618V10.3605ZM15.2381 6.54978C15.2381 5.7996 14.6596 5.54954 13.9988 5.54954H12.5807C12.4843 5.54954 12.3949 5.62089 12.384 5.71732L11.8054 9.36022C11.7984 9.43158 11.8517 9.50293 11.9199 9.50293H12.652C12.7234 9.50293 12.7768 9.44958 12.7948 9.38851L12.9555 8.35291C12.9915 8.09578 13.4273 8.18513 13.5983 8.18513C14.6127 8.18513 15.2375 7.5783 15.2375 6.54978H15.2381ZM18.2447 6.86412H17.5658C17.4302 6.86412 17.4231 7.06083 17.4122 7.15725C17.2155 6.85384 16.9121 6.79984 16.5656 6.79984C15.6907 6.79984 15.0228 7.56738 15.0228 8.41398C15.0228 9.11016 15.4586 9.564 16.1548 9.564C16.4872 9.564 16.887 9.38915 17.1011 9.13909C17.0901 9.19245 17.0651 9.30687 17.0651 9.36087C17.0651 9.44315 17.1011 9.50358 17.1795 9.50358H17.7972C17.8937 9.50358 17.976 9.40008 17.994 9.2998L18.3584 7.00362C18.3694 6.93548 18.3154 6.86412 18.244 6.86412H18.2447ZM19.9411 5.67489C19.9411 5.60354 19.8877 5.55018 19.8267 5.55018H19.1658C19.1125 5.55018 19.0585 5.59325 19.0514 5.6466L18.4729 9.36087L18.4626 9.37887C18.4626 9.44315 18.5159 9.50358 18.5873 9.50358H19.1768C19.2661 9.50358 19.3555 9.40008 19.3625 9.2998L19.9411 5.68582V5.67489ZM16.7269 7.52495C16.2911 7.52495 15.9517 7.87143 15.9517 8.31049C15.9517 8.65697 16.2017 8.84596 16.5302 8.84596C16.959 8.84596 17.3055 8.51748 17.3055 8.07842C17.3093 7.72873 17.0593 7.52495 16.7269 7.52495V7.52495Z"></path></svg>`,
  },
  {
    service: "GitHub",
    value: "github.com/LinusBolls",
    href: "https://github.com/LinusBolls",
    icon: `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.79897 0.000512621C4.26785 0.000512621 0.596924 3.67451 0.596924 8.20255C0.596924 11.8284 2.94681 14.9016 6.20353 15.9858C6.61517 16.0632 6.76383 15.8094 6.76383 15.59C6.76383 15.3952 6.75922 14.88 6.75615 14.1962C4.47341 14.6904 3.99257 13.0935 3.99257 13.0935C3.61886 12.1483 3.07958 11.8945 3.07958 11.8945C2.33729 11.3875 3.13853 11.3983 3.13853 11.3983C3.96079 11.4542 4.39344 12.2415 4.39344 12.2415C5.12496 13.4965 6.31272 13.1335 6.7828 12.9223C6.85457 12.3938 7.06834 12.0303 7.30107 11.8279C5.48021 11.6223 3.56555 10.9174 3.56555 7.77451C3.56555 6.8769 3.88338 6.14589 4.40882 5.57175C4.31809 5.36619 4.04024 4.5306 4.4811 3.40077C4.4811 3.40077 5.16751 3.18188 6.73667 4.24199C7.39334 4.06001 8.09052 3.96928 8.78718 3.96466C9.48435 3.96928 10.181 4.06052 10.8377 4.24199C12.3976 3.18188 13.0835 3.40077 13.0835 3.40077C13.5239 4.5306 13.246 5.36567 13.166 5.57175C13.6864 6.14589 14.0042 6.87741 14.0042 7.77451C14.0042 10.9246 12.087 11.6192 10.2641 11.8197C10.5491 12.0652 10.8162 12.5701 10.8162 13.3365C10.8162 14.4335 10.8059 15.3173 10.8059 15.5844C10.8059 15.7976 10.9494 16.054 11.3718 15.9714C14.6527 14.8985 17 11.8227 17 8.20204C17 3.674 13.3291 0 8.79794 0L8.79897 0.000512621Z"></path></svg>`,
  },
  {
    service: "LinkedIn",
    value: "linkedin.com/in/LinusBolls",
    href: "https://www.linkedin.com/in/LinusBolls/",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mercado-match" width="20" height="20"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path></svg>`,
  },
  {
    service: "Address",
    value: "Berlin, Germany",
    href: null,
    icon: `<svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.79824 3.76154C6.3654 3.76154 5.94227 3.88989 5.58238 4.13036C5.22248 4.37084 4.94197 4.71264 4.77633 5.11253C4.61069 5.51243 4.56735 5.95246 4.65179 6.37699C4.73624 6.80151 4.94467 7.19147 5.25074 7.49753C5.5568 7.8036 5.94676 8.01204 6.37128 8.09648C6.79581 8.18092 7.23585 8.13758 7.63574 7.97194C8.03564 7.8063 8.37743 7.52579 8.61791 7.1659C8.85838 6.806 8.98674 6.38288 8.98674 5.95003C8.98608 5.36981 8.75529 4.81354 8.34501 4.40326C7.93473 3.99298 7.37846 3.7622 6.79824 3.76154V3.76154ZM6.79824 7.04428C6.58182 7.04428 6.37026 6.9801 6.19031 6.85987C6.01036 6.73963 5.87011 6.56873 5.78729 6.36878C5.70446 6.16884 5.68279 5.94882 5.72502 5.73656C5.76724 5.52429 5.87146 5.32932 6.02449 5.17628C6.17752 5.02325 6.3725 4.91903 6.58476 4.87681C6.79703 4.83459 7.01704 4.85626 7.21699 4.93908C7.41694 5.0219 7.58784 5.16215 7.70807 5.3421C7.82831 5.52205 7.89249 5.73361 7.89249 5.95003C7.89215 6.24014 7.77676 6.51827 7.57162 6.72341C7.36648 6.92855 7.08835 7.04395 6.79824 7.04428V7.04428Z"></path><path d="M11.0036 1.7414C9.96383 0.701877 8.57584 0.0843591 7.10753 0.00802616C5.63922 -0.0683068 4.19468 0.401957 3.05271 1.32806C1.91074 2.25415 1.15229 3.57044 0.923746 5.02286C0.695202 6.47528 1.01276 7.96087 1.81514 9.19292L5.94959 15.54C6.0416 15.6812 6.1674 15.7973 6.31559 15.8776C6.46378 15.9579 6.62967 16 6.79823 16C6.96679 16 7.13268 15.9579 7.28087 15.8776C7.42907 15.7973 7.55487 15.6812 7.64687 15.54L11.7815 9.19292C12.526 8.05002 12.855 6.68593 12.7134 5.32928C12.5718 3.97264 11.9681 2.70591 11.0036 1.7414V1.7414ZM10.8646 8.59564L6.79825 14.838L2.73185 8.59564C1.48714 6.68484 1.7541 4.12772 3.36662 2.51514C3.81726 2.06448 4.35226 1.707 4.94106 1.4631C5.52986 1.21921 6.16093 1.09368 6.79825 1.09368C7.43556 1.09368 8.06664 1.21921 8.65544 1.4631C9.24424 1.707 9.77924 2.06448 10.2299 2.51514C11.8424 4.12772 12.1093 6.68484 10.8646 8.59564Z"></path></svg>`,
  },
];

const addContactQrCodeSvg = await QRCode.toString(vcardDataUri, {
  type: "svg",
  width: 16 * 12,
  color: {
    dark: "#fff",
    light: "#ffffff00", // the 00 at the end is the alpha channel, this makes the background of the qr code transparent
  },
  margin: 0,
  errorCorrectionLevel: "L",
});

async function site() {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Cache-Control" content="public, max-age=86400, immutable">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Linus Bolls - Contact Info</title>
        <meta name="description" content="I'm Linus, a fullstack engineer with a passion for good UX and effective meetings ツ" />
        <meta name="keywords" content="Linus Bolls, Software Engineer, Freelancer, Fullstack Developer, Web Developer, Berlin, Portfolio, LinkedIn">
        <meta property="og:title" content="Linus Bolls - Contact Info" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="/banner.webp" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(
          faviconSvg
        )}">
        <style>*{box-sizing:border-box;}.b:hover{background:#fff;color:#000!important}a.a:hover{color:#fff!important;border-left-width:2px!important;padding-right:0px!important}.a svg{fill:#aaa}a.a:hover svg{fill:#fff}
        	@media screen and (min-width: 800px) {
              body {justify-content:center}
              .b {display:none !important}
            }
            @media screen and (max-width: 800px) {
                body {padding-top:3rem!important}
                .qr {display:none !important}
            }
        </style>
    </head>
    <body style="margin:0;padding:0;min-height:100vh;display:flex;flex-direction:column-reverse;align-items:center;background: #000; color: #fff; font-size: 1rem; font-family: Arial">
        <div style="display:flex;flex-direction:column;width:100%;max-width:32rem;padding:0 1rem 5rem 1rem">
            <div style="display:flex; gap: 1rem">
              <div class="qr" style="width:15rem;flex:1;display:flex;align-items:center; justify-content:center">            
                <div style="position:relative">
                  ${addContactSvg}
                  ${addContactQrCodeSvg}  
                </div>
              </div>
                <div style="display:flex;flex-direction: column">
            ${links
              .map((i) => {
                return `${
                  i.href ? `<a target="_blank" href="${i.href}"` : "<div"
                } class="a" style="width:100%;border-left: 0px solid #fff; padding-right:2px;display: flex; align-items: center; text-decoration: none; font-weight: bold; transition: all 0.05s; height: 3rem; color: #aaa"><div style="height: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center">${
                  i.icon
                }</div>${i.value}${i.href ? "</a>" : "</div>"}`;
              })
              .join("")}
                </div>
            </div>
            <a class="b" href="${vcardDataUri}" download="Linus_Bolls.vcf" style="border-radius:2px;margin-top: 1rem;display: flex; align-items: center; justify-content: center; text-decoration: none; color: #fff; font-weight: bold; transition: all 0.2s; width: 100%; min-height: 3rem; border: 1px solid #fff">Add to contacts</a>
        </div>
            <h1 style="font-size: 2.5rem;margin-bottom:1rem;font-weight:700">Linus Bolls</h1>
            <div style="height: 15rem; width: 15rem">
    <img alt="Picture of me" src="${inlineWebp(
      join(outDir, "avatar.resized.webp")
    )}" style="background:#0d0d0d;width: 15rem; height: 15rem; border-radius: 50%; object-fit: cover; line-height:15rem;text-align:center">
    </div>
    </body>
</html>`;
}

await fs.promises.mkdir(outDir, { recursive: true });

await fs.promises.writeFile(join(outDir, "index.html"), await site(), "utf-8");

function inlineWebp(filePath: string) {
  const image = fs.readFileSync(filePath);
  return `data:image/webp;base64,${image.toString("base64")}`;
}

async function generateBanner() {
  await nodeHtmlToImage({
    output: bannerPath + ".png",
    html: `
    <html style="width: 2062px; height: 1080px; padding: 0; margin: 0">
      <body style="display: flex; align-items: center; justify-content: center; padding: 0; margin: 0; background: #000">
        <img src="data:image/webp;base64,{{base64Image}}" style="width: 42rem; height: 42rem; border-radius: 50%; object-fit: cover" />
      </body>
    </html>
  `,
    content: {
      base64Image: fs.readFileSync(avatarPath, "base64"),
    },
    type: "png",
    quality: 100, // 0-100
  });

  await sharp(bannerPath + ".png")
    .webp({ quality: 80 }) // 0-100
    .toFile(bannerPath);

  await fs.promises.rm(bannerPath + ".png");
}
generateBanner();

async function resizeToSquare(
  inputPath: string,
  outputPath: string,
  size: number
) {
  await sharp(inputPath)
    .resize({
      width: size,
      height: size,
      fit: "cover",
      position: "center",
    })
    .toFile(outputPath);
}
