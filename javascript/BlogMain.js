/* =============================================
		Blog Main Page Javascript
		
		Author: Surya Paruchuri.
		Email: surya@umd.edu
		Date: Jul 28 2019.
		(C) Copyright Surya Paruchuri. 2019 - Present.
   ============================================= */

// Disable console logs for deployment.
var DEBUG = false;	// false: Disable; true: Enable.
if (!DEBUG)
{
	console.log = function() {};
}

console.log(" -- This is from Blog Main script -- ");

// call init function afte page loads;
window.onload =  init;
document.onload = renderAgain;

// =============================================
//			VARIABLES
// =============================================
// Global Variables;
var m_isDisplayedPostLatest;	// Is the current displayed post latest one.
var m_currDisplayedPostIndex;	// current displayed post index.
var m_currDisplayedPostURL;		// current displayed post's URL.
var m_postList;					// Oroganized list of all Posts (after Parsing the JSON File).
var m_rootBlogDir;				// Root dir string of the webpage (used to construct URLs).
var m_newerPostURL;				// Newer post's URL (If already displaying latest post, then null).
var m_newerPostIndex;			// Newer post's index.
var m_isNewerPostAvailable;		// Flag to indicate if an newer post is available or not.
var m_olderPostURL;				// Older post's URL (If already displaying latest post, then null).
var m_olderPostIndex;			// Older post's index (If already displaying latest post, then null).
var m_isOlderPostAvailable;		// Flag to indicate if older post than current one is  available.
var m_postsListJSONFilePath;	// Posts List JSON file (fully descriptive path).
var m_LatestXMLHTTPRequestData;	// Latest XML HTTP Request data returned by server;
var m_LatestXMLHTTPRequestJSON;	// Latest XML HTTP Request data returned and parsed for JSON data.

// ==============================================
//			COMMUNICATION Functions
// ==============================================
/* GetFileFromServer():
	Description:
		This function fetches HTML/JSON fileCreatedDate
		from the server when the url represents the path of
		the resource relative to Webpage root directory
	Parameters:
		url: url of the resource requesting wrt webpage root.
	Return:
		Nothing.
*/
function GetFileFromServer(url,callback, isResultJSON)
{
	console.log(" -- GetFileFromServer(): -- ");
	console.log(" -- File: -- " + url);
	var result = null;
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange = function() {
		console.log(" -- onreadystatechange() -- ");
		if (xmlHttp.readyState == 4)
			console.log(" -- ready Status -- ");
				if (xmlHttp.status == 200){
					console.log(" -- status: 200 -- ");
					if (isResultJSON == true){
						if (isValidJSON(xmlHttp.responseText) == true){
							m_LatestXMLHTTPRequestData = xmlHttp.responseText;
							callback();
						}
					}
					else{
						m_LatestXMLHTTPRequestData = xmlHttp.responseText;
						callback();
					}
				}
				if (xmlHttp.status == 404){
					console.log(" -- status:404 -- ");
					m_LatestXMLHTTPRequestData = "<h2> Page Not found. </h2> ";
				}
	}
	xmlHttp.open("GET", url, true); // true for asynchronous;
	xmlHttp.send();
}

// =============================================
//			CONTENT REQUEST HANDLERS
// =============================================
/* DisplayPostByIndex()
	Description:
		Display Post with the requested index as seen
		in the organized posts list. Additionally updates
		the prev and next indices accordingly.
	Parameters:
		index: indx of the Post in the list.
	Return:
		None:	
*/
function DisplayPostByIndex(index)
{
	console.log(" -- DisplayPostByIndex -- ");
	
	// error checks
	if ((index > (m_postList.length-1)) || (index < 0))
	{
		alert("Invalid index requested.");
	}
	
	// callBack function to update DOM with response data.
	var cbDisplayCallBack = function(){
		console.log(" -- cbDisplayCallBack -- ");
		var postElement = document.getElementById("blogContent");
		postElement.innerHTML = m_LatestXMLHTTPRequestData;
		// render Again
		renderAgain();
		// update navigation controls.
		updateNavgControls();
	}
	
	var url = m_rootBlogDir + m_postList[index].path + m_postList[index].page;
	console.log("url:" + url);	
	GetFileFromServer(url,cbDisplayCallBack,false);
	
	// Render the Newer post.
	console.log("New Post displayed. renderAgain will be called");
	renderAgain();
	
	/* Update m_currDisplayedPostIndex
		to reflect that this page is requested.
		This, shall be used later on to update controls.
	*/
	m_currDisplayedPostIndex = index;
}

// =============================================
//				BLOG NAVIGATION
// =============================================
/* displayOlderPost():
	Description:
		displays first older post wrt. current displayed
		post.
	Parameters:
		None.
	Return:
		None.
*/
function displayOlderPost()
{
	console.log(" -- displayOlderPost -- ");
	if (m_isOlderPostAvailable != false && m_olderPostIndex != null 
		&& m_olderPostIndex != undefined && m_olderPostIndex >= 0)
	{
		DisplayPostByIndex(m_olderPostIndex);
	}
	else
	{
		alert("Apologies, this is the oldest post on the blog. \
				Looks like there is a bug in the program, as\
				older button should have been disabled when \
				displaying current post.");
	}
}

/* displayNewerPost
	Description:
		displays the first latest post wrt current displayed
		post.
	Parameters:
		None.
	Return:
		None.
*/
function displayNewerPost()
{
	console.log(" -- displayNewerPost -- ");
	if (m_isNewerPostAvailable != false && m_newerPostIndex != null
		&& m_newerPostIndex != undefined && m_isNewerPostAvailable < m_postList.length)
	{
		DisplayPostByIndex(m_newerPostIndex);
	}
	else
	{
		alert("Apologies, this is the latest post on the blog. \
				Looks like there is a bug in the program, as\
				newer button should have been disabled when \
				displaying current post.");
	}
}

/* displayIndex()
	Description:
		displays a list of all posts as index of the blog.
	Parameters:
		None.
	Return:
		None.
*/
function displayIndex()
{
	console.log("display Index");
	
	// Disable the prev and next buttons.
	// Newer Buttons.
	var PrevNextElements = document.getElementsByClassName('blogNavNewerPost');
	for (i=0; i<PrevNextElements.length; i++)
	{
		PrevNextElements[i].style.visibility='hidden';
	}
	// Older Buttons.
	var PrevNextElements = document.getElementsByClassName('blogNavOlderPost');
	for (i=0; i<PrevNextElements.length; i++)
	{
		PrevNextElements[i].style.visibility='hidden';
	}
	var PrevNextElements = document.getElementsByClassName('blogNavIndex');
	// Index Buttons.
	for (i=0; i<PrevNextElements.length; i++)
	{
		PrevNextElements[i].style.visibility='hidden';
	}
	
	// Construct the HTML string.
	var indexHTMLStr = '<p class="sectionHeadings"> Index:</p> <p class="indexContent">';
	for (i=0; i < m_postList.length; i++)
	{
		indexHTMLStr = indexHTMLStr + '<img src = "../images/bullet.png" height="10" width="10"> ';
		indexHTMLStr = indexHTMLStr + m_postList[i].PostHeading;
		indexHTMLStr = indexHTMLStr + '<button class="button" onclick="displaySelectedPost(' ;
		indexHTMLStr = indexHTMLStr +  i.toString() + ')" title="Go To Post">Go To Post </button>' + '</br>';
	}
	indexHTMLStr = indexHTMLStr + '</p>';
	
	// Update DOM;
	var contentElement = document.getElementById("blogContent");
	contentElement.innerHTML = indexHTMLStr;	
}

/* displaySelectedPost():
	Description:
		callback from the button clicks from index page.
	Parameters:
		index: post index selected by User
	Return:
		None
*/
function displaySelectedPost(index)
{
	console.log("displaySelectedPost");
	
	// call DisplayPostByIndex to display 
	// the requested Post and render it.
	DisplayPostByIndex(index);
	renderAgain();	
}

/* updateNavgControls()
	Description:
		Updates the older and newer posts indices accordingly
		and either hides/sets the Older and /newer Buttons to
		be visible to user to navigate the blog.
	Parameters:
		None
	Return:
		None
*/
function updateNavgControls()
{
	console.log(" -- updateNavgControls -- ");
	
	// Update the posts state info.
	index = m_currDisplayedPostIndex;
	if (index == 0){
		m_isDisplayedPostLatest = true;
		// Only a single post on Blog case.
		if (m_postList.length <= 1){
			m_isOlderPostAvailable = false;
			m_olderPostIndex = null;
		}
		else{
			m_isOlderPostAvailable = true;
			m_olderPostIndex = index + 1;
		}
		// Since it is latest post diable Newer Post Option.
		m_isNewerPostAvailable = false;
		m_newerPostIndex = null;
	}
	else
	{
		m_isNewerPostAvailable = true;
		m_newerPostIndex = index - 1;
		// Check if at last post.
		if (index == (m_postList.length -1))
		{
			m_isOlderPostAvailable = false;
			m_olderPostIndex = null;
		}
		else{
			m_isOlderPostAvailable = true;
			m_olderPostIndex = index + 1;
		}
	}
	
	// Set Newer Buttons visibility.
	var ele = document.getElementsByClassName("blogNavNewerPost");
	for (var i = 0; i < ele.length; i++)
	{
		if (m_isNewerPostAvailable == true) {
			ele[i].style.visibility = 'visible';
		}
		else {
			ele[i].style.visibility = 'hidden';
		}
	}
	
	// Set Older Buttons visibility.
	var ele = document.getElementsByClassName("blogNavOlderPost");
	for (var i = 0; i < ele.length; i++)
	{
		if (m_isOlderPostAvailable == true) {
			ele[i].style.visibility = 'visible';
		}
		else {
			ele[i].style.visibility = 'hidden';
		}
	}

	//  Set Index Button to visible.
	var ele = document.getElementsByClassName("blogNavIndex");
	for (var i = 0; i < ele.length; i++)
	{
		ele[i].style.visibility = 'visible'
	}
}


// =============================================
//			BLOG INIT Functions
// =============================================
/* init():
	Description:
		Initialization function called upon 
		when page loading is complete. 
	Parameters:
		None
	Result:
		None
*/
function init()
{
	console.log("-- init() -- ");
	
	// initialize the global variables
	m_isDisplayedPostLatest = false;	
	m_currDisplayedPostIndex = null;	
	m_currDisplayedPostURL = null;		
	m_postList = null;					
	m_rootBlogDir = "../techBlog/";
	m_newerPostURL = null;				
	m_newerPostIndex = null;			
	m_olderPostURL = null;				
	m_olderPostIndex = null;			
	m_isOlderPostAvailable = false;		
	m_isNewerPostAvailable = false;
	m_LatestXMLHTTPRequestData = null;
	m_LatestXMLHTTPRequestJSON = null;	
	m_postsListJSONFilePath = m_rootBlogDir + "PostsList.json"
	
	// construct organized PostsLists
	constructPostsList();
}

/* constructPostsList():
	Description:
		fetches the JSON file data from server and constructs the
		an ordered Posts list with the Oldest post one indexed as 0;
	Parameters:
		None
	Return:
		None
*/
function constructPostsList()
{
	console.log(" -- constructPostsList -- ");
	
	// callBack Function called after fetching JSON file.
	var cbConstructPostsList = function() {
		console.log(" -- cbConstructPostsList -- ");
		m_LatestXMLHTTPRequestJSON = JSON.parse(m_LatestXMLHTTPRequestData);
		m_postList = m_LatestXMLHTTPRequestJSON["list"];
		
		/* Order posts in chronologically descending order
		   Meaning: Latest Post indexed as 0 and Oldest as 
		   (m_postList.length-1). */
		var cmpListfunction = function(a,b){
			var a_dir = a.path.split("\/");
			var b_dir = b.path.split("\/");
			var a_int = parseInt(a_dir[0]);
			var b_int = parseInt(b_dir[0]);
			return b_int - a_int;
		}
		m_postList.sort(cmpListfunction);
		// Display latest Post by default.
		DisplayPostByIndex(0);	// 0 --> Latest Post, after Descending sort;
	}
	
	// Request JSON File from server.
	GetFileFromServer(m_postsListJSONFilePath,cbConstructPostsList,true);
}

// =============================================
//			UTILITY Functions
// =============================================
/* isValidJSON():
	Description:
		Checks if the string is a vlid JSON
		string
	Parameters:
		str string to verify if in JSON format.
	Return:
		true for Valid JSON; else false;
*/
function isValidJSON(str)
{
	try	{
		JSON.parse(str);
		return true;
	}
	catch (e){
		return false;
	}
	return false;
}

/* renderAgain():
	Description:
		Function queues Typset request to MathJax queues
		to re-render/Typeset the euations again.
	Parameters:
		None
	Return:
		None
*/
function renderAgain()
{
	console.log(" -- renderAgain -- ");
	
	/* Rerender by calling Typset() on a specific DOM-"blogContent".
		To do this in async way - as MathJax might be currently 
		rendering a page- addEventListener it to MathJax's Job Queue.;
	*/
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,"blogContent"]);
	var ele = document.getElementsByClassName("footer");
	ele[0].style.visibility = 'hidden';
}