import { useState, useEffect, useRef } from 'react';
import { 
  FiHome, FiTrendingUp, FiUsers, FiSearch, FiEdit3, 
  FiHeart, FiMessageCircle, FiShare2, FiMoreVertical,
  FiX, FiImage, FiCode, FiSend, FiBookmark, FiUserPlus,
  FiUserCheck, FiClock, FiEye
} from 'react-icons/fi';
import { 
  getCommunityPosts, 
  createPost, 
  likePost, 
  commentOnPost,
  followUser,
  unfollowUser,
  getFollowing,
  getTrendingPosts,
  searchUsers
} from '../firebase';
import './Community.css';

function Community({ onClose, authUser, userProfile }) {
  const [activeTab, setActiveTab] = useState('feed'); // feed, trending, following, search
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCode, setNewPostCode] = useState('');
  const [newPostLanguage, setNewPostLanguage] = useState('javascript');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    if (authUser && userProfile) {
      loadFeed();
      loadFollowing();
    }
  }, [authUser, userProfile]);

  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrending();
    }
  }, [activeTab]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const feedPosts = await getCommunityPosts();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    setLoading(true);
    try {
      const trending = await getTrendingPosts();
      setTrendingPosts(trending);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const followingList = await getFollowing(authUser.uid);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostCode.trim()) return;

    try {
      await createPost(authUser.uid, userProfile.username, {
        content: newPostContent,
        code: newPostCode,
        language: newPostLanguage,
        avatar: userProfile.photoURL
      });
      
      setNewPostContent('');
      setNewPostCode('');
      setShowCreatePost(false);
      loadFeed();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId, authUser.uid);
      loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await commentOnPost(postId, authUser.uid, userProfile.username, comment);
      loadFeed();
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(authUser.uid, userId);
      loadFollowing();
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(authUser.uid, userId);
      loadFollowing();
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  const PostCard = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const isLiked = post.likes?.includes(authUser.uid);
    const isFollowing = following.includes(post.userId);

    return (
      <div className="post-card">
        <div className="post-header">
          <img src={post.avatar} alt={post.username} className="post-avatar" />
          <div className="post-user-info">
            <div className="post-username">
              {post.username}
              {post.username === 'gaulmt' && (
                <svg className="verified-badge-mini" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="currentColor"/>
                </svg>
              )}
            </div>
            <div className="post-time">
              <FiClock size={12} /> {formatTime(post.createdAt)}
            </div>
          </div>
          <div className="post-actions-menu">
            {post.userId !== authUser.uid && (
              <button 
                className={`follow-btn-mini ${isFollowing ? 'following' : ''}`}
                onClick={() => isFollowing ? handleUnfollow(post.userId) : handleFollow(post.userId)}
              >
                {isFollowing ? <FiUserCheck size={14} /> : <FiUserPlus size={14} />}
              </button>
            )}
            <button className="more-btn">
              <FiMoreVertical />
            </button>
          </div>
        </div>

        <div className="post-content">
          {post.content && <p>{post.content}</p>}
          {post.code && (
            <div className="post-code">
              <div className="code-header">
                <FiCode size={14} />
                <span>{post.language}</span>
              </div>
              <pre><code>{post.code}</code></pre>
            </div>
          )}
        </div>

        <div className="post-stats">
          <span>{post.likes?.length || 0} lượt thích</span>
          <span>{post.comments?.length || 0} bình luận</span>
          <span><FiEye size={14} /> {post.views || 0}</span>
        </div>

        <div className="post-interactions">
          <button 
            className={`interaction-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(post.id)}
          >
            <FiHeart /> Thích
          </button>
          <button 
            className="interaction-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <FiMessageCircle /> Bình luận
          </button>
          <button className="interaction-btn">
            <FiShare2 /> Chia sẻ
          </button>
          <button className="interaction-btn">
            <FiBookmark /> Lưu
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            <div className="comment-input">
              <img src={userProfile.photoURL} alt="You" className="comment-avatar" />
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    handleComment(post.id, commentText);
                    setCommentText('');
                  }
                }}
              />
              <button 
                className="send-comment-btn"
                onClick={() => {
                  if (commentText.trim()) {
                    handleComment(post.id, commentText);
                    setCommentText('');
                  }
                }}
              >
                <FiSend />
              </button>
            </div>

            <div className="comments-list">
              {post.comments?.map((comment, idx) => (
                <div key={idx} className="comment">
                  <img src={comment.avatar} alt={comment.username} className="comment-avatar" />
                  <div className="comment-content">
                    <div className="comment-username">{comment.username}</div>
                    <div className="comment-text">{comment.text}</div>
                    <div className="comment-time">{formatTime(comment.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="community-overlay">
      <div className="community-container">
        {/* Header */}
        <div className="community-header">
          <h2>🌐 Cộng đồng Code Net</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <div className="community-nav">
          <button 
            className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <FiHome /> Bảng tin
          </button>
          <button 
            className={`nav-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <FiTrendingUp /> Thịnh hành
          </button>
          <button 
            className={`nav-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <FiUsers /> Đang theo dõi
          </button>
          <button 
            className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <FiSearch /> Tìm kiếm
          </button>
        </div>

        {/* Create Post Button */}
        <button className="create-post-btn" onClick={() => setShowCreatePost(true)}>
          <FiEdit3 /> Tạo bài viết
        </button>

        {/* Content */}
        <div className="community-content" ref={feedRef}>
          {activeTab === 'search' && (
            <div className="search-section">
              <div className="search-bar">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Tìm</button>
              </div>
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user.id} className="user-card">
                    <img src={user.photoURL} alt={user.username} />
                    <div className="user-info">
                      <div className="username">{user.username}</div>
                      <div className="user-stats">{user.followers || 0} người theo dõi</div>
                    </div>
                    <button 
                      className="follow-btn"
                      onClick={() => handleFollow(user.id)}
                    >
                      <FiUserPlus /> Theo dõi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="feed">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : posts.length === 0 ? (
                <div className="empty-feed">
                  <p>Chưa có bài viết nào</p>
                  <p className="hint">Hãy tạo bài viết đầu tiên!</p>
                </div>
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="feed">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : trendingPosts.length === 0 ? (
                <div className="empty-feed">
                  <p>Chưa có bài viết thịnh hành</p>
                </div>
              ) : (
                trendingPosts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="create-post-modal">
            <div className="modal-header">
              <h3>Tạo bài viết mới</h3>
              <button onClick={() => setShowCreatePost(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Bạn đang nghĩ gì?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
              
              <div className="code-section">
                <div className="code-header-input">
                  <FiCode />
                  <select 
                    value={newPostLanguage}
                    onChange={(e) => setNewPostLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>
                <textarea
                  placeholder="Chia sẻ code của bạn... (optional)"
                  value={newPostCode}
                  onChange={(e) => setNewPostCode(e.target.value)}
                  rows={6}
                  className="code-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreatePost(false)}>
                Hủy
              </button>
              <button className="btn-post" onClick={handleCreatePost}>
                <FiSend /> Đăng bài
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
