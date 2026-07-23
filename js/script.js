const searchInput = document.getElementById("homeSearch");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");

function searchSchemes(){

    const keyword = searchInput.value.trim().toLowerCase();

    if(keyword===""){

        searchResults.style.display="none";

        return;

    }

    const filtered = schemes.filter(scheme=>{

        return(

            scheme.schemeName.toLowerCase().includes(keyword)

            ||

            scheme.category.toLowerCase().includes(keyword)

            ||

            scheme.organization.toLowerCase().includes(keyword)

            ||

            scheme.occupation.toLowerCase().includes(keyword)

        );

    });

    showSearchResults(filtered);

}

function showSearchResults(data){

    searchResults.innerHTML="";

    if(data.length===0){

        searchResults.innerHTML=`

        <div class="search-item">

            No Scheme Found

        </div>

        `;

    }

    else{

        data.forEach(scheme=>{

            searchResults.innerHTML+=`

            <div

            class="search-item"

            onclick="openScheme(${scheme.id})">

                <h6>

                    ${scheme.schemeName}

                </h6>

                <small>

                    ${scheme.category}

                    •

                    ${scheme.organization}

                </small>

            </div>

            `;

        });

    }

    searchResults.style.display="block";

}

searchInput.addEventListener("keyup",searchSchemes);

searchBtn.addEventListener("click",searchSchemes);

document.addEventListener("click",function(e){

    if(!document.querySelector(".search-box").contains(e.target)){

        searchResults.style.display="none";

    }

});

function openScheme(id){

    window.location.href=`pages/explore.html?scheme=${id}`;

}