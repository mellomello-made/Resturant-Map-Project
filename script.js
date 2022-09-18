var container = document.getElementById("map"); //지도를 담을 영역의 DOM 레퍼런스
var options = {
  //지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(37.565526, 126.977967), //지도의 중심좌표.
  level: 8, //지도의 레벨(확대, 축소 정도) 3에서 8로 확대
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 지도에 확대 축소 컨트롤을 생성
let zoomControl = new kakao.maps.ZoomControl();

// 지도의 우측에 확대 축소 컨트롤을 추가
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/
const dataSet = [
  {
    title: "희락돈까스",
    address: "서울 영등포구 양산로 210",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "한식",
  },
  {
    title: "즉석우동짜장",
    address: "서울 영등포구 대방천로 260",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "분식",
  },
  {
    title: "아카사카",
    address: "서울 서초구 서초대로74길 23",
    url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
    category: "일식",
  },
];

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

//주소 좌표 변환 함수
function getcoordsByAddress(address) {
  return new Promise((resolve, reject) => {
    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        resolve(coords);
        return;
      }
      reject(new Error("getcoordsByAddress Error: not Valid Address"));
    });
  });
}

setMap(dataSet);

//4. 마커에 인포윈도우 붙이기

function getContent(data) {
  //유튜브 섬네일 id 가져오기
  let replaceUrl = data.url;
  let finUrl = "";
  replaceUrl = replaceUrl.replace("https://youtu.be/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
  finUrl = replaceUrl.split("&")[0];

  // 인포 윈도우 가공하기
  const result = `
  <div class="infowindow">
  <div class="infowindow-img-container">
    <img
      src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg"
      class="infowindow-img"
    />
    <div class="infowindow-body">
      <h5 class="infowindow-title">${data.title}</h5>
      <p class="infowindow-address">${data.address}</p>
      <a href="${data.url}" class="infowindow-btn" target="_blank"></a>
    </div>
  </div>
</div>`;
  return result;
}

async function setMap(dataSet) {
  for (var i = 0; i < dataSet.length; i++) {
    //마커 생성하기
    let coords = await getcoordsByAddress(dataSet[i].address);

    //마커 생성하기
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords, // 마커를 표시할 위치
    });

    markerArray.push(marker);

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
    });

    // 인포 윈도우가 생성될 때 마다 객체를 추가해준다.
    infowindowArray.push(infowindow);

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, coords)
    );
    kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
  }
}
// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// 1. 클릭시 다른 인포윈도우 닫기
// 2. 클릭한 곳으로 지도 중심 옮기기

function makeOverListener(map, marker, infowindow, coords) {
  return function () {
    //1. 클릭시 다른 인포윈도우 닫기
    closeInfowindow();
    infowindow.open(map, marker);
    map.panTo(coords);
  };
}

let infowindowArray = [];
function closeInfowindow() {
  //객체들 하나하나에 클로즈 메소드를 호출해준다
  for (let infowindow of infowindowArray) {
    infowindow.close();
  }
}

// 인포 윈도우를 관리할 배열 만들어주기

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}

/*--------카테고리 분류하기 ---------  */
//카테고리 객체를 만들어주고 이벤트를 만들어준다 그 카테고리에 맞는 데이터만 뿌려줄수 있게.
//카테고리 리스트 디브 태그에 클릭 이벤트를 붙여준다

const categoryMap = {
  korea: "한식",
  china: "중식",
  japan: "일식",
  america: "양식",
  wheat: "분식",
  meat: "구이",
  sushi: "회/초밥",
  etc: "기타",
};
//카테고리 리스트를 선택하고 클릭에 반응하도록 클릭이벤트를 달아준다.
const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

function categoryHandler(event) {
  const categoryId = event.target.id;

  //category 변수에 한식 or 중식 or 일식 .. 저장된다.
  const category = categoryMap[categoryId];

  //데이터 분류하기
  //빈배열을 하나 생생하고 dataset for 문 돌리기
  //data.category와 카테고리가 일치하면 categorizeDataSet에 넣어준다
  let categorizeDataSet = [];
  for (let data of dataSet) {
    if (data.category === category) {
      categorizeDataSet.push(data);
    }
  }

  console.log(categorizeDataSet);

  //버튼이 눌렸을때, 기존의 마커 삭제, 기존의 인포 윈도우 닫아준다.
  //기존의 마커 삭제
  closeMarker();

  //기존 인포 윈도우 닫기
  closeInfowindow();
  //실행
  setMap(categorizeDataSet);
}
let markerArray = [];
function closeMarker() {
  for (marker of markerArray) {
    marker.setMap(null);
  }
}
