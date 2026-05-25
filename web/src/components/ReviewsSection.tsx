'use client';

import { useState } from 'react';
import type { Testimonial } from '@/lib/cms';

interface Props {
  reviews: Testimonial[];
  title?: string;
  kicker?: string;
  kickerColour?: string;
  maxInitial?: number;
}

/**
 * Text-first reviews grid. Most cards are pull-quotes. Video reviews
 * blend in as poster tiles that open inline when tapped.
 *
 * Layout: 2-column on tablet+, single column on mobile. Reviews flow in
 * insertion order so Anna controls sequencing via sort_order in the CMS.
 */
export default function ReviewsSection({
  reviews,
  title = 'What people say',
  kicker = 'Reviews',
  kickerColour = '#6E3A5A',
  maxInitial = 6,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);

  if (!reviews || reviews.length === 0) return null;

  const visible = showAll ? reviews : reviews.slice(0, maxInitial);
  const hasMore = reviews.length > maxInitial;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: reviewStyles }} />
      <section className="reviews-section">
        <div className="reviews-inner">
          <p className="reviews-kicker" style={{ color: kickerColour }}>{kicker}</p>
          <h2 className="reviews-title">{title}</h2>

          <div className="reviews-grid">
            {visible.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                accent={kickerColour}
                isPlaying={playing === r.id}
                onPlay={() => setPlaying(r.id)}
              />
            ))}
          </div>

          {hasMore && !showAll && (
            <div className="reviews-more">
              <button
                onClick={() => setShowAll(true)}
                className="reviews-more-btn"
                style={{ borderColor: kickerColour, color: kickerColour }}
              >
                Show all {reviews.length} reviews
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ReviewCard({
  review,
  accent,
  isPlaying,
  onPlay,
}: {
  review: Testimonial;
  accent: string;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const hasVideo = Boolean(review.videoUrl);
  const meta = [review.reviewerName, review.reviewerLocation].filter(Boolean).join(' — ');

  if (hasVideo) {
    return (
      <article className="review-card review-card-video">
        {isPlaying ? (
          <video
            src={review.videoUrl}
            controls
            autoPlay
            playsInline
            poster={review.videoThumbnail || undefined}
            className="review-video"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="review-video-poster"
            style={
              review.videoThumbnail
                ? { backgroundImage: `url(${review.videoThumbnail})` }
                : { background: `linear-gradient(160deg, ${accent}, #231F20)` }
            }
            aria-label={`Play video review from ${review.reviewerName}`}
          >
            <span className="review-play-icon" style={{ background: accent }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
        {review.quote && <p className="review-quote review-quote-video">&ldquo;{review.quote}&rdquo;</p>}
        <p className="review-meta">{meta}</p>
      </article>
    );
  }

  return (
    <article className="review-card review-card-text">
      {review.rating && <Stars rating={review.rating} colour={accent} />}
      <p className="review-quote">&ldquo;{review.quote}&rdquo;</p>
      <p className="review-meta">{meta}</p>
    </article>
  );
}

function Stars({ rating, colour }: { rating: number; colour: string }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14" fill={i <= rating ? colour : 'rgba(0,0,0,0.12)'}>
          <path d="M12 2l2.9 6.6L22 9.7l-5 4.9 1.2 6.9L12 18.3 5.8 21.5 7 14.6 2 9.7l7.1-1.1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const reviewStyles = `
.reviews-section { background:#F9F6F1; padding:3rem 3rem; }
.reviews-inner { max-width:1100px; margin:0 auto; }
.reviews-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.reviews-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.5rem,3vw,2.2rem); color:#231F20; line-height:1.3; margin-bottom:2rem; text-align:center; }
.reviews-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
@media (max-width:700px) { .reviews-grid { grid-template-columns:1fr; } }
.review-card { background:#fff; padding:1.5rem 1.5rem 1.25rem; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.04); display:flex; flex-direction:column; gap:0.75rem; }
.review-stars { display:flex; gap:0.15rem; margin-bottom:0.25rem; }
.review-quote { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.7; font-style:italic; margin:0; }
.review-quote-video { font-size:0.95rem; margin-top:0.5rem; }
.review-meta { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; color:#8C8880; margin:0; }
.review-card-video { padding:0; overflow:hidden; }
.review-card-video .review-quote-video, .review-card-video .review-meta { padding:0 1.25rem; }
.review-card-video .review-meta { padding-bottom:1.25rem; }
.review-video-poster { width:100%; aspect-ratio:16/9; border:none; cursor:pointer; background-size:cover; background-position:center; position:relative; display:block; padding:0; }
.review-video-poster:hover .review-play-icon { transform:translate(-50%,-50%) scale(1.1); }
.review-play-icon { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.3); transition:transform 0.25s; }
.review-play-icon svg { margin-left:3px; }
.review-video { width:100%; aspect-ratio:16/9; display:block; background:#000; }
.reviews-more { text-align:center; margin-top:2rem; }
.reviews-more-btn { background:transparent; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.14em; text-transform:uppercase; padding:0.7rem 1.6rem; border-radius:3px; border:1px solid; cursor:pointer; transition:all 0.25s; }
.reviews-more-btn:hover { opacity:0.75; }
@media (max-width:700px) { .reviews-section { padding:2rem 1.2rem; } }
`;
