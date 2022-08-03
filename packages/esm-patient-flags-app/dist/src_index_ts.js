(self["webpackChunk_kenyaemr_esm_patient_flags_app"] = self["webpackChunk_kenyaemr_esm_patient_flags_app"] || []).push([["src_index_ts"],{

/***/ "./src/config-schema.ts":
/*!******************************!*\
  !*** ./src/config-schema.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "configSchema": () => (/* binding */ configSchema)
/* harmony export */ });
var configSchema = {};


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "backendDependencies": () => (/* binding */ backendDependencies),
/* harmony export */   "importTranslation": () => (/* binding */ importTranslation),
/* harmony export */   "setupOpenMRS": () => (/* binding */ setupOpenMRS)
/* harmony export */ });
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openmrs/esm-framework */ "webpack/sharing/consume/default/@openmrs/esm-framework/@openmrs/esm-framework");
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _config_schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config-schema */ "./src/config-schema.ts");


var importTranslation = __webpack_require__("./translations lazy .json$");
var backendDependencies = {
    kenyaemr: "^18.2.0"
};
function setupOpenMRS() {
    var moduleName = "@kenyaemr/esm-patient-flags-app";
    var options = {
        featureName: "patient-flags",
        moduleName: moduleName
    };
    (0,_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.defineConfigSchema)(moduleName, _config_schema__WEBPACK_IMPORTED_MODULE_1__.configSchema);
    return {
        pages: [],
        extensions: [
            {
                name: "patient-flag",
                slot: "patient-banner-tags-slot",
                load: (0,_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.getAsyncLifecycle)(function() {
                    return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_carbon-components-react_es_components_InlineLoading_InlineLoading_js-nod-d3dbbb"), __webpack_require__.e("webpack_sharing_consume_default_react_react"), __webpack_require__.e("src_patient-flags_patient-flags_component_tsx-webpack_sharing_consume_default_carbon-componen-86dc48")]).then(__webpack_require__.bind(__webpack_require__, /*! ./patient-flags/patient-flags.component */ "./src/patient-flags/patient-flags.component.tsx"));
                }, options),
                online: true,
                offline: false
            }, 
        ]
    };
}



/***/ }),

/***/ "./translations lazy .json$":
/*!************************************************!*\
  !*** ./translations/ lazy nonrecursive .json$ ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./en.json": [
		"./translations/en.json",
		"translations_en_json"
	],
	"./sw.json": [
		"./translations/sw.json",
		"translations_sw_json"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./translations lazy .json$";
module.exports = webpackAsyncContext;

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX2luZGV4X3RzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBTyxJQUFNQSxZQUFZLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBZ0Q7QUFDaEM7QUFFL0MsSUFBTUcsaUJBQWlCLEdBQUdDLGlEQUEyRDtBQUVyRixJQUFNRSxtQkFBbUIsR0FBRztJQUMxQkMsUUFBUSxFQUFFLFNBQVM7Q0FDcEI7QUFFRCxTQUFTQyxZQUFZLEdBQUc7SUFDdEIsSUFBTUMsVUFBVSxHQUFHLGlDQUFpQztJQUVwRCxJQUFNQyxPQUFPLEdBQUc7UUFDZEMsV0FBVyxFQUFFLGVBQWU7UUFDNUJGLFVBQVUsRUFBVkEsVUFBVTtLQUNYO0lBRURSLDBFQUFrQixDQUFDUSxVQUFVLEVBQUVULHdEQUFZLENBQUMsQ0FBQztJQUU3QyxPQUFPO1FBQ0xZLEtBQUssRUFBRSxFQUFFO1FBQ1RDLFVBQVUsRUFBRTtZQUNWO2dCQUNFQyxJQUFJLEVBQUUsY0FBYztnQkFDcEJDLElBQUksRUFBRSwwQkFBMEI7Z0JBQ2hDQyxJQUFJLEVBQUVkLHlFQUFpQixDQUFDOzJCQUFNLHNmQUFpRDtpQkFBQSxFQUFFUSxPQUFPLENBQUM7Z0JBQ3pGTyxNQUFNLEVBQUUsSUFBSTtnQkFDWkMsT0FBTyxFQUFFLEtBQUs7YUFDZjtTQUNGO0tBQ0YsQ0FBQztDQUNIO0FBRStEOzs7Ozs7Ozs7OztBQ2pDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGtlbnlhZW1yL2VzbS1wYXRpZW50LWZsYWdzLWFwcC8uL3NyYy9jb25maWctc2NoZW1hLnRzIiwid2VicGFjazovL0BrZW55YWVtci9lc20tcGF0aWVudC1mbGFncy1hcHAvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vQGtlbnlhZW1yL2VzbS1wYXRpZW50LWZsYWdzLWFwcC8uL3RyYW5zbGF0aW9ucy8gbGF6eSBub25yZWN1cnNpdmUgLmpzb24kIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBjb25maWdTY2hlbWEgPSB7fTtcbiIsImltcG9ydCB7IGRlZmluZUNvbmZpZ1NjaGVtYSwgZ2V0QXN5bmNMaWZlY3ljbGUgfSBmcm9tICdAb3Blbm1ycy9lc20tZnJhbWV3b3JrJztcbmltcG9ydCB7IGNvbmZpZ1NjaGVtYSB9IGZyb20gJy4vY29uZmlnLXNjaGVtYSc7XG5cbmNvbnN0IGltcG9ydFRyYW5zbGF0aW9uID0gcmVxdWlyZS5jb250ZXh0KCcuLi90cmFuc2xhdGlvbnMnLCBmYWxzZSwgLy5qc29uJC8sICdsYXp5Jyk7XG5cbmNvbnN0IGJhY2tlbmREZXBlbmRlbmNpZXMgPSB7XG4gIGtlbnlhZW1yOiAnXjE4LjIuMCcsXG59O1xuXG5mdW5jdGlvbiBzZXR1cE9wZW5NUlMoKSB7XG4gIGNvbnN0IG1vZHVsZU5hbWUgPSAnQGtlbnlhZW1yL2VzbS1wYXRpZW50LWZsYWdzLWFwcCc7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBmZWF0dXJlTmFtZTogJ3BhdGllbnQtZmxhZ3MnLFxuICAgIG1vZHVsZU5hbWUsXG4gIH07XG5cbiAgZGVmaW5lQ29uZmlnU2NoZW1hKG1vZHVsZU5hbWUsIGNvbmZpZ1NjaGVtYSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwYWdlczogW10sXG4gICAgZXh0ZW5zaW9uczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAncGF0aWVudC1mbGFnJyxcbiAgICAgICAgc2xvdDogJ3BhdGllbnQtYmFubmVyLXRhZ3Mtc2xvdCcsXG4gICAgICAgIGxvYWQ6IGdldEFzeW5jTGlmZWN5Y2xlKCgpID0+IGltcG9ydCgnLi9wYXRpZW50LWZsYWdzL3BhdGllbnQtZmxhZ3MuY29tcG9uZW50JyksIG9wdGlvbnMpLFxuICAgICAgICBvbmxpbmU6IHRydWUsXG4gICAgICAgIG9mZmxpbmU6IGZhbHNlLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xufVxuXG5leHBvcnQgeyBiYWNrZW5kRGVwZW5kZW5jaWVzLCBpbXBvcnRUcmFuc2xhdGlvbiwgc2V0dXBPcGVuTVJTIH07XG4iLCJ2YXIgbWFwID0ge1xuXHRcIi4vZW4uanNvblwiOiBbXG5cdFx0XCIuL3RyYW5zbGF0aW9ucy9lbi5qc29uXCIsXG5cdFx0XCJ0cmFuc2xhdGlvbnNfZW5fanNvblwiXG5cdF0sXG5cdFwiLi9zdy5qc29uXCI6IFtcblx0XHRcIi4vdHJhbnNsYXRpb25zL3N3Lmpzb25cIixcblx0XHRcInRyYW5zbGF0aW9uc19zd19qc29uXCJcblx0XVxufTtcbmZ1bmN0aW9uIHdlYnBhY2tBc3luY0NvbnRleHQocmVxKSB7XG5cdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8obWFwLCByZXEpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgcmVxICsgXCInXCIpO1xuXHRcdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBtYXBbcmVxXSwgaWQgPSBpZHNbMF07XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmUoaWRzWzFdKS50aGVuKCgpID0+IHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhpZCk7XG5cdH0pO1xufVxud2VicGFja0FzeW5jQ29udGV4dC5rZXlzID0gKCkgPT4gKE9iamVjdC5rZXlzKG1hcCkpO1xud2VicGFja0FzeW5jQ29udGV4dC5pZCA9IFwiLi90cmFuc2xhdGlvbnMgbGF6eSAuanNvbiRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiXSwibmFtZXMiOlsiY29uZmlnU2NoZW1hIiwiZGVmaW5lQ29uZmlnU2NoZW1hIiwiZ2V0QXN5bmNMaWZlY3ljbGUiLCJpbXBvcnRUcmFuc2xhdGlvbiIsInJlcXVpcmUiLCJjb250ZXh0IiwiYmFja2VuZERlcGVuZGVuY2llcyIsImtlbnlhZW1yIiwic2V0dXBPcGVuTVJTIiwibW9kdWxlTmFtZSIsIm9wdGlvbnMiLCJmZWF0dXJlTmFtZSIsInBhZ2VzIiwiZXh0ZW5zaW9ucyIsIm5hbWUiLCJzbG90IiwibG9hZCIsIm9ubGluZSIsIm9mZmxpbmUiXSwic291cmNlUm9vdCI6IiJ9