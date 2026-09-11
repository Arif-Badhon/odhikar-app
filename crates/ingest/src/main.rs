use dotenvy::dotenv;
use serde::Deserialize;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::Row;
use std::env;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct LegalEntry {
    source_title: String,
    issuing_authority: String,
    document_type: String,
    act_name: String,
    act_year: i32,
    section_reference: String,
    official_url: String,
    article_slug: String,
    category: String,
    title_bn: String,
    title_en: String,
    summary_bn: String,
    summary_en: String,
    what_this_means_bn: String,
    what_you_need_bn: String,
    common_documents_bn: String,
    when_to_seek_help_bn: String,
    where_to_get_help_bn: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in your .env file");

    let api_url = env::var("KNOWLEDGE_API_URL")
        .unwrap_or_else(|_| "https://project8.qubitsolutionlab.com/api/knowledge".to_string());

    println!(">>> Connecting to Supabase at runtime...");
    
    let connect_options = PgConnectOptions::from_str(&database_url)?
        .statement_cache_capacity(0);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await?;

    println!(">>> Fetching knowledge data from API: {}...", api_url);
    
    let client = reqwest::Client::new();
    let response = client.get(&api_url).send().await?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to fetch API. Status: {}", response.status()).into());
    }

    let entries: Vec<LegalEntry> = response.json().await?;

    println!(">>> Ingesting {} verified entries into database...", entries.len());

    for entry in entries {
        let source_row = sqlx::query(
            r#"
            INSERT INTO knowledge_sources (
                source_title, issuing_authority, document_type,
                act_name, act_year, section_reference, official_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            "#
        )
        .bind(&entry.source_title)
        .bind(&entry.issuing_authority)
        .bind(&entry.document_type)
        .bind(entry.act_name)
        .bind(entry.act_year)
        .bind(&entry.section_reference)
        .bind(&entry.official_url)
        .fetch_one(&pool)
        .await?;

        let source_id: Uuid = source_row.get("id");

        let article_row = sqlx::query(
            r#"
            INSERT INTO knowledge_articles (
                slug, category, title_bn, title_en, summary_bn, summary_en,
                what_this_means_bn, what_you_need_bn, common_documents_bn,
                when_to_seek_help_bn, where_to_get_help_bn
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (slug) DO UPDATE SET
                title_bn = EXCLUDED.title_bn,
                last_reviewed_at = NOW()
            RETURNING id
            "#
        )
        .bind(&entry.article_slug)
        .bind(&entry.category)
        .bind(&entry.title_bn)
        .bind(&entry.title_en)
        .bind(&entry.summary_bn)
        .bind(&entry.summary_en)
        .bind(&entry.what_this_means_bn)
        .bind(&entry.what_you_need_bn)
        .bind(&entry.common_documents_bn)
        .bind(&entry.when_to_seek_help_bn)
        .bind(&entry.where_to_get_help_bn)
        .fetch_one(&pool)
        .await?;

        let article_id: Uuid = article_row.get("id");

        sqlx::query(
            r#"
            INSERT INTO article_source_mappings (article_id, source_id, section_name)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING
            "#
        )
        .bind(article_id)
        .bind(source_id)
        .bind("Primary Governing Statute")
        .execute(&pool)
        .await?;

        println!(" [OK] Ingested: {} ({})", entry.title_bn, entry.article_slug);
    }

    println!(">>> Ingestion completed successfully.");
    Ok(())
}