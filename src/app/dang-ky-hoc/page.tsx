import type { Metadata } from "next";

import { EnrollWizard } from "@/components/register/EnrollWizard";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { PageBanner } from "@/components/ui/PageBanner";
import { courses, packagesOf, registerCourses, registerHero, registerRules } from "@/data/courses";
import { formatVnd } from "@/lib/format";

import "./register.css";

export const metadata: Metadata = {
  title: "Đăng ký học",
  description: "Các khoá học thư pháp Việt căn bản Online của Thanh Phong Thư Môn: gói học, học phí, nội quy và phiếu đăng ký.",
};

export const dynamic = "force-static";

export default function RegisterPage() {
  return (
    <SidebarLayout>
      <article className="reg">
        <PageBanner title={registerHero.title} lead={registerHero.lead} />

        <section className="reg-section reg-rules" aria-labelledby="reg-rules">
          <h2 id="reg-rules">{registerRules.title}</h2>
          {registerRules.groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              {"lead" in group && group.lead ? <p>{group.lead}</p> : null}
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="reg-section" aria-labelledby="reg-courses">
          <h2 id="reg-courses">{registerCourses.title}</h2>
          <p className="reg-muted">{registerCourses.lead}</p>
          {courses.map((course) => (
            <article key={course.id} className="reg-course">
              <p className={course.open ? "reg-badge" : "reg-badge reg-badge-closed"}>{course.open ? registerCourses.open : registerCourses.closed}</p>
              <h3>{course.name}</h3>
              <p>{course.summary}</p>
              <ul className="reg-meta">
                {course.meta.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="reg-packages-grid">
                {packagesOf(course).map((pkg) => (
                  <section key={pkg.id} className={pkg.hot ? "reg-pkg reg-pkg-hot" : "reg-pkg"} aria-label={pkg.name}>
                    {pkg.hot ? <span className="reg-pkg-flag">Phổ biến</span> : null}
                    <h4>{pkg.name}</h4>
                    <p className="reg-pkg-price">
                      {pkg.oldPrice ? <s>{formatVnd(pkg.oldPrice)}</s> : null}
                      <strong>{pkg.price > 0 ? formatVnd(pkg.price) : "0đ"}</strong>
                    </p>
                    <ul>
                      {pkg.yes.map((item) => (
                        <li key={item} className="reg-yes">
                          {item}
                        </li>
                      ))}
                      {pkg.no?.map((item) => (
                        <li key={item} className="reg-no">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="reg-section" id="dang-ky" aria-label="Đăng ký học theo 3 bước">
          <EnrollWizard />
        </section>

      </article>
    </SidebarLayout>
  );
}
