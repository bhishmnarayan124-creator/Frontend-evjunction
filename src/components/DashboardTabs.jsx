import { Car, TrendingUp, User } from "lucide-react";
import { ListingsTab } from "./ListingsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { ProfileTab } from "./ProfileTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const DashboardTabs = ({
  activeTab,
  setActiveTab,
  myListings,
  loading,
  stats,
  user,
  onDeleteListing,
  formatPrice,
}) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      {/* Tabs Header */}
      <TabsList className="rounded-xl p-1 inline-flex bg-[var(--card)] border border-[var(--border)]">
        
        {/* Listings Tab */}
        <TabsTrigger
          value="listings"
          className="
            rounded-lg px-6 py-2.5 transition-all
            text-[var(--text2)]
            data-[state=active]:bg-[var(--accent)]
            data-[state=active]:text-black
          "
        >
          <Car className="w-4 h-4 mr-2 text-[var(--accent)]" />

          My Listings

          {myListings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
              {myListings.length}
            </span>
          )}
        </TabsTrigger>

        {/* Analytics Tab */}
        <TabsTrigger
          value="analytics"
          className="
            rounded-lg px-6 py-2.5 transition-all
            text-[var(--text2)]
            data-[state=active]:bg-[var(--accent)]
            data-[state=active]:text-black
          "
        >
          <TrendingUp className="w-4 h-4 mr-2 text-[var(--purple)]" />
          Analytics
        </TabsTrigger>

        {/* Profile Tab */}
        <TabsTrigger
          value="profile"
          className="
            rounded-lg px-6 py-2.5 transition-all
            text-[var(--text2)]
            data-[state=active]:bg-[var(--accent)]
            data-[state=active]:text-black
          "
        >
          <User className="w-4 h-4 mr-2 text-[var(--blue)]" />
          Profile
        </TabsTrigger>

      </TabsList>

      {/* Listings Content */}
      <TabsContent value="listings">
        <ListingsTab
          myListings={myListings}
          loading={loading}
          onDeleteListing={onDeleteListing}
          formatPrice={formatPrice}
        />
      </TabsContent>

      {/* Analytics Content */}
      <TabsContent value="analytics">
        <AnalyticsTab
          myListings={myListings}
          stats={stats}
          formatPrice={formatPrice}
        />
      </TabsContent>

      {/* Profile Content */}
      <TabsContent value="profile">
        <ProfileTab user={user} />
      </TabsContent>
    </Tabs>
  );
};