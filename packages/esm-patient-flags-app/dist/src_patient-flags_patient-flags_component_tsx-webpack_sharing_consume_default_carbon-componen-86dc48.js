"use strict";
(self["webpackChunk_kenyaemr_esm_patient_flags_app"] = self["webpackChunk_kenyaemr_esm_patient_flags_app"] || []).push([["src_patient-flags_patient-flags_component_tsx-webpack_sharing_consume_default_carbon-componen-86dc48"],{

/***/ "./src/hooks/usePatientFlags.tsx":
/*!***************************************!*\
  !*** ./src/hooks/usePatientFlags.tsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "usePatientFlags": () => (/* binding */ usePatientFlags)
/* harmony export */ });
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openmrs/esm-framework */ "webpack/sharing/consume/default/@openmrs/esm-framework/@openmrs/esm-framework");
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var swr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! swr */ "../../node_modules/swr/dist/index.mjs");


/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient idenfier
 * @returns An array of patient identifiers
 */ var usePatientFlags = function(patientUuid) {
    var ref;
    var patientFlagsUrl = "/ws/rest/v1/kenyaemr/flags?patientUuid=".concat(patientUuid);
    var ref1 = (0,swr__WEBPACK_IMPORTED_MODULE_1__["default"])(patientFlagsUrl, _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.openmrsFetch), data = ref1.data, mutate = ref1.mutate, error = ref1.error;
    var ref2;
    var patientFlags = typeof (data === null || data === void 0 ? void 0 : data.data) === "string" ? [] : (ref2 = data === null || data === void 0 ? void 0 : (ref = data.data) === null || ref === void 0 ? void 0 : ref.results) !== null && ref2 !== void 0 ? ref2 : [];
    return {
        patientFlags: patientFlags,
        isLoading: !data && !error,
        error: error
    };
};


/***/ }),

/***/ "./src/patient-flags/patient-flags.component.tsx":
/*!*******************************************************!*\
  !*** ./src/patient-flags/patient-flags.component.tsx ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var carbon_components_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! carbon-components-react */ "../../node_modules/carbon-components-react/es/components/Tag/Tag.js");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _hooks_usePatientFlags__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/usePatientFlags */ "./src/hooks/usePatientFlags.tsx");




var PatientFlags = function(param) {
    var patientUuid = param.patientUuid;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_1__.useTranslation)().t;
    var ref = (0,_hooks_usePatientFlags__WEBPACK_IMPORTED_MODULE_2__.usePatientFlags)(patientUuid), patientFlags = ref.patientFlags, error = ref.error;
    if (error) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, t("errorPatientFlags", "Error loading patient flags"));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, patientFlags.map(function(patientFlag) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0___default().createElement(carbon_components_react__WEBPACK_IMPORTED_MODULE_3__["default"], {
            key: patientFlag,
            type: "magenta"
        }, patientFlag);
    }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PatientFlags);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3BhdGllbnQtZmxhZ3NfcGF0aWVudC1mbGFnc19jb21wb25lbnRfdHN4LXdlYnBhY2tfc2hhcmluZ19jb25zdW1lX2RlZmF1bHRfY2FyYm9uLWNvbXBvbmVuLTg2ZGM0OC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXNEO0FBQzdCO0FBUXpCOzs7OztHQUtHLENBQ0ksSUFBTUUsZUFBZSxHQUFHLFNBQUNDLFdBQW1CLEVBQTZCO1FBR25CQyxHQUFVO0lBRnJFLElBQU1DLGVBQWUsR0FBRyx5Q0FBd0MsQ0FBYyxPQUFaRixXQUFXLENBQUU7SUFDL0UsSUFBZ0NGLElBQTJFLEdBQTNFQSwrQ0FBTSxDQUF1Q0ksZUFBZSxFQUFFTCxnRUFBWSxDQUFDLEVBQW5HSSxJQUFJLEdBQW9CSCxJQUEyRSxDQUFuR0csSUFBSSxFQUFFRSxNQUFNLEdBQVlMLElBQTJFLENBQTdGSyxNQUFNLEVBQUVDLEtBQUssR0FBS04sSUFBMkUsQ0FBckZNLEtBQUs7UUFDZ0NILElBQW1CO0lBQTlFLElBQU1JLFlBQVksR0FBRyxPQUFPSixDQUFBQSxJQUFJLGFBQUpBLElBQUksV0FBTSxHQUFWQSxLQUFBQSxDQUFVLEdBQVZBLElBQUksQ0FBRUEsSUFBSSxNQUFLLFFBQVEsR0FBRyxFQUFFLEdBQUdBLENBQUFBLElBQW1CLEdBQW5CQSxJQUFJLGFBQUpBLElBQUksV0FBTSxHQUFWQSxLQUFBQSxDQUFVLEdBQVZBLENBQUFBLEdBQVUsR0FBVkEsSUFBSSxDQUFFQSxJQUFJLGNBQVZBLEdBQVUsY0FBVkEsS0FBQUEsQ0FBVSxHQUFWQSxHQUFVLENBQUVLLE9BQU8sY0FBbkJMLElBQW1CLGNBQW5CQSxJQUFtQixHQUFJLEVBQUU7SUFDcEYsT0FBTztRQUFFSSxZQUFZLEVBQVpBLFlBQVk7UUFBRUUsU0FBUyxFQUFFLENBQUNOLElBQUksSUFBSSxDQUFDRyxLQUFLO1FBQUVBLEtBQUssRUFBTEEsS0FBSztLQUFFLENBQUM7Q0FDNUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEJ3QjtBQUNtQztBQUNkO0FBQ1k7QUFNM0QsSUFBTU8sWUFBWSxHQUFnQyxnQkFBcUI7UUFBbEJYLFdBQVcsU0FBWEEsV0FBVztJQUM5RCxJQUFNLENBQUcsR0FBS1UsNkRBQWMsRUFBRSxDQUF0QkUsQ0FBQztJQUNULElBQWdDYixHQUE0QixHQUE1QkEsdUVBQWUsQ0FBQ0MsV0FBVyxDQUFDLEVBQXBESyxZQUFZLEdBQVlOLEdBQTRCLENBQXBETSxZQUFZLEVBQUVELEtBQUssR0FBS0wsR0FBNEIsQ0FBdENLLEtBQUs7SUFFM0IsSUFBSUEsS0FBSyxFQUFFO1FBQ1QscUJBQU8sMkRBQUNTLE1BQUksUUFBRUQsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLDZCQUE2QixDQUFDLENBQVEsQ0FBQztLQUM3RTtJQUVELHFCQUNFLDBIQUNHUCxZQUFZLENBQUNTLEdBQUcsQ0FBQyxTQUFDQyxXQUFXOzZCQUM1QiwyREFBQ04sK0RBQUc7WUFBQ08sR0FBRyxFQUFFRCxXQUFXO1lBQUVFLElBQUksRUFBQyxTQUFTO1dBQ2xDRixXQUFXLENBQ1I7S0FDUCxDQUFDLENBQ0QsQ0FDSDtDQUNIO0FBRUQsaUVBQWVKLFlBQVksRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL0BrZW55YWVtci9lc20tcGF0aWVudC1mbGFncy1hcHAvLi9zcmMvaG9va3MvdXNlUGF0aWVudEZsYWdzLnRzeCIsIndlYnBhY2s6Ly9Aa2VueWFlbXIvZXNtLXBhdGllbnQtZmxhZ3MtYXBwLy4vc3JjL3BhdGllbnQtZmxhZ3MvcGF0aWVudC1mbGFncy5jb21wb25lbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG9wZW5tcnNGZXRjaCB9IGZyb20gJ0BvcGVubXJzL2VzbS1mcmFtZXdvcmsnO1xuaW1wb3J0IHVzZVNXUiBmcm9tICdzd3InO1xuXG5pbnRlcmZhY2UgUGF0aWVudEZsYWdzUmV0dXJuVHlwZSB7XG4gIHBhdGllbnRGbGFnczogQXJyYXk8c3RyaW5nPjtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xuICBlcnJvcjogRXJyb3I7XG59XG5cbi8qKlxuICogUmVhY3QgaG9vayB0aGF0IHRha2VzIGluIGEgcGF0aWVudCB1dWlkIGFuZCByZXR1cm5zXG4gKiBwYXRpZW50IGZsYWdzIGZvciB0aGF0IHBhdGllbnQgdG9nZXRoZXIgd2l0aCBoZWxwZXIgb2JqZWN0c1xuICogQHBhcmFtIHBhdGllbnRVdWlkIFVuaXF1ZSBwYXRpZW50IGlkZW5maWVyXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBwYXRpZW50IGlkZW50aWZpZXJzXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VQYXRpZW50RmxhZ3MgPSAocGF0aWVudFV1aWQ6IHN0cmluZyk6IFBhdGllbnRGbGFnc1JldHVyblR5cGUgPT4ge1xuICBjb25zdCBwYXRpZW50RmxhZ3NVcmwgPSBgL3dzL3Jlc3QvdjEva2VueWFlbXIvZmxhZ3M/cGF0aWVudFV1aWQ9JHtwYXRpZW50VXVpZH1gO1xuICBjb25zdCB7IGRhdGEsIG11dGF0ZSwgZXJyb3IgfSA9IHVzZVNXUjx7IGRhdGE6IHsgcmVzdWx0czogQXJyYXk8c3RyaW5nPiB9IH0+KHBhdGllbnRGbGFnc1VybCwgb3Blbm1yc0ZldGNoKTtcbiAgY29uc3QgcGF0aWVudEZsYWdzID0gdHlwZW9mIGRhdGE/LmRhdGEgPT09ICdzdHJpbmcnID8gW10gOiBkYXRhPy5kYXRhPy5yZXN1bHRzID8/IFtdO1xuICByZXR1cm4geyBwYXRpZW50RmxhZ3MsIGlzTG9hZGluZzogIWRhdGEgJiYgIWVycm9yLCBlcnJvciB9O1xufTtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJbmxpbmVMb2FkaW5nLCBUYWcgfSBmcm9tICdjYXJib24tY29tcG9uZW50cy1yZWFjdCc7XG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ3JlYWN0LWkxOG5leHQnO1xuaW1wb3J0IHsgdXNlUGF0aWVudEZsYWdzIH0gZnJvbSAnLi4vaG9va3MvdXNlUGF0aWVudEZsYWdzJztcblxuaW50ZXJmYWNlIFBhdGllbnRGbGFnc1Byb3BzIHtcbiAgcGF0aWVudFV1aWQ6IHN0cmluZztcbn1cblxuY29uc3QgUGF0aWVudEZsYWdzOiBSZWFjdC5GQzxQYXRpZW50RmxhZ3NQcm9wcz4gPSAoeyBwYXRpZW50VXVpZCB9KSA9PiB7XG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcbiAgY29uc3QgeyBwYXRpZW50RmxhZ3MsIGVycm9yIH0gPSB1c2VQYXRpZW50RmxhZ3MocGF0aWVudFV1aWQpO1xuXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiA8c3Bhbj57dCgnZXJyb3JQYXRpZW50RmxhZ3MnLCAnRXJyb3IgbG9hZGluZyBwYXRpZW50IGZsYWdzJyl9PC9zcGFuPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtwYXRpZW50RmxhZ3MubWFwKChwYXRpZW50RmxhZykgPT4gKFxuICAgICAgICA8VGFnIGtleT17cGF0aWVudEZsYWd9IHR5cGU9XCJtYWdlbnRhXCI+XG4gICAgICAgICAge3BhdGllbnRGbGFnfVxuICAgICAgICA8L1RhZz5cbiAgICAgICkpfVxuICAgIDwvPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGF0aWVudEZsYWdzO1xuIl0sIm5hbWVzIjpbIm9wZW5tcnNGZXRjaCIsInVzZVNXUiIsInVzZVBhdGllbnRGbGFncyIsInBhdGllbnRVdWlkIiwiZGF0YSIsInBhdGllbnRGbGFnc1VybCIsIm11dGF0ZSIsImVycm9yIiwicGF0aWVudEZsYWdzIiwicmVzdWx0cyIsImlzTG9hZGluZyIsIlJlYWN0IiwiVGFnIiwidXNlVHJhbnNsYXRpb24iLCJQYXRpZW50RmxhZ3MiLCJ0Iiwic3BhbiIsIm1hcCIsInBhdGllbnRGbGFnIiwia2V5IiwidHlwZSJdLCJzb3VyY2VSb290IjoiIn0=