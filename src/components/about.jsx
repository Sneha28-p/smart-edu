import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1>About LearnHub</h1>
        <p className="tagline">Empowering Your Learning Journey with AI-Powered Tools</p>
      </header>

      <section className="mission-section">
        <div className="content-wrapper">
          <h2>Our Mission</h2>
          <p>
            At LearnHub, we believe that learning should be personalized, efficient, and data-driven. 
            We leverage cutting-edge technology to provide students with the tools they need to succeed in their academic journey.
          </p>
        </div>
      </section>

      <section className="story-section">
        <div className="content-wrapper">
          <h2>Our Story</h2>
          <p>
            Smart Education was born from a simple observation: traditional education methods don't work for everyone. 
            We set out to create a platform that adapts to each student's unique needs, combining artificial intelligence 
            with educational best practices to deliver a truly personalized learning experience.
          </p>
          <p>
            Today, we're helping thousands of students achieve their academic goals by providing them with intelligent 
            tools that make studying more effective, efficient, and engaging.
          </p>
        </div>
      </section>

      <section className="values-section">
        <div className="content-wrapper">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h4>Innovation</h4>
              <p>We continuously evolve our platform using the latest in AI and educational technology.</p>
            </div>
            <div className="value-item">
              <h4>Accessibility</h4>
              <p>Quality education should be available to everyone, everywhere, at any time.</p>
            </div>
            <div className="value-item">
              <h4>Student Success</h4>
              <p>Your achievements are our achievements. We measure our success by yours.</p>
            </div>
            <div className="value-item">
              <h4>Data Privacy</h4>
              <p>We protect your personal information and learning data with the highest security standards.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="content-wrapper">
          <h2>Get In Touch</h2>
          <p className="contact-intro">Have questions? We'd love to hear from you. Reach out to us through any of the following channels.</p>
          
          <div className="contact-info">
            <div className="contact-item">
              <div>
                <h4>Email</h4>
                <a href="mailto:info@smarteducation.com">info@learnhub.com</a>
                <a href="mailto:support@smarteducation.com">support@learnhub.com</a>
              </div>
            </div>

            <div className="contact-item">
              <div>
                <h4>Phone</h4>
                <a href="xyz">xyz</a>
                <p className="contact-hours">Mon-Fri: 9AM - 6PM</p>
              </div>
            </div>

            <div className="contact-item">
              <div>
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="#" className="social-link">LinkedIn</a>
                  <a href="#" className="social-link">Twitter</a>
                  <a href="#" className="social-link">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
