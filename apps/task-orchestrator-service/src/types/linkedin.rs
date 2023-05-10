
#[derive(Debug, Default, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Person {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub full_name: Option<String>,
    pub follower_count: Option<i32>,
    pub occupation: Option<String>,
    pub headline: Option<String>,
    pub summary: Option<String>,
    pub country: Option<String>,
    pub country_full_name: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub experiences: Option<Vec<Experience>>,
    pub education: Option<Vec<Education>>,
    pub connections: Option<i32>,
}

#[derive(Debug, Default, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Experience {
    pub starts_at: Option<Time>,
    pub ends_at: Option<Time>,
    pub company: Option<String>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub logo_url: Option<String>,
}

#[derive(Debug, Default, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Education {
    pub starts_at: Option<Time>,
    pub ends_at: Option<Time>,
    pub field_of_study: Option<String>,
    pub degree_name: Option<String>,
    pub school: Option<String>,
    pub activities_and_societies: Option<String>,

}

#[derive(Debug, Default, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Time {
    pub day: Option<i32>,
    pub month: Option<i32>,
    pub year: Option<i32>,
}