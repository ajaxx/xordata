let sections = [
    { 'key': 'patient', 'title': 'Patient', 'icon': 'fa-hospital-user' },
    { 'key': 'procedures', 'title': 'Procedures', 'icon': 'fa-heart-pulse' },
    { 'key': 'medication', 'title': 'Medication', 'icon': 'fa-prescription' },
    { 'key': 'questions', 'title': 'Questions & Answers', 'icon': 'fa-clipboard-question' },
    { 'key': 'service_requests', 'title': 'Service Requests', 'icon': 'fa-book-medical' }
];

function isSection(section) {
    return true;
}

module.exports = {
    sections : sections,
    isSection : isSection
}